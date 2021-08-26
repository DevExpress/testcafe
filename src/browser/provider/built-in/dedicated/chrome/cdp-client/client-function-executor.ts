import Protocol from 'devtools-protocol';
import { CallsiteRecord } from 'callsite-record';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import RuntimeApi = ProtocolProxyApi.RuntimeApi;
import EvaluateRequest = Protocol.Runtime.EvaluateRequest;
import RemoteObject = Protocol.Runtime.RemoteObject;
import ExceptionDetails = Protocol.Runtime.ExceptionDetails;
import PropertyPreview = Protocol.Runtime.PropertyPreview;
import DOMApi = ProtocolProxyApi.DOMApi;
import ExecutionContextCreatedEvent = Protocol.Runtime.ExecutionContextCreatedEvent;
import ExecutionContextDestroyedEvent = Protocol.Runtime.ExecutionContextDestroyedEvent;
import DOM = Protocol.DOM;
import * as Errors from '../../../../../../shared/errors';
import {
    ExecuteClientFunctionCommand,
    ExecuteClientFunctionCommandBase,
    ExecuteSelectorCommand,
} from '../../../../../../test-run/commands/observation';


interface EvaluationError extends Error {
    request: EvaluateRequest;
    response: { code: number };
}

interface EvaluateScriptResult {
    result: RemoteObject | null;
    exceptionDetails: ExceptionDetails | null;
    error: EvaluationError | null;
}

interface SelectorSnapshotArgs {
    Runtime: RuntimeApi;
    command: ExecuteSelectorCommand;
    callsite: CallsiteRecord;
    selectorTimeout: number;
    errTypes: {
        notFound: string;
        invisible: string;
    };
}

interface SelectorNodeArgs extends SelectorSnapshotArgs {
    DOM: DOMApi;
}


const EXECUTION_CTX_WAS_DESTROYED_CODE = -32000;
const SELECTOR_MAX_EXECUTE_COUNT       = 10;
const PROXYLESS_SCRIPT                 = 'window["%proxyless%"]';


export default class ClientFunctionExecutor {
    // new Map<frameId, executionContextId>
    private readonly _frameExecutionContexts = new Map<string, number>();
    private _currentFrameId: string = '';

    public async evaluateScript (Runtime: RuntimeApi, expression: string): Promise<EvaluateScriptResult> {
        const script: EvaluateRequest = { expression, awaitPromise: true };

        if (this._currentFrameId && this._frameExecutionContexts.has(this._currentFrameId))
            script.contextId = this._frameExecutionContexts.get(this._currentFrameId);

        try {
            const { result, exceptionDetails = null } = await Runtime.evaluate(script);

            return { result, exceptionDetails, error: null };
        }
        catch (error) {
            return { result: null, exceptionDetails: null, error };
        }
    }

    private async _evaluateScriptWithReloadPageIgnore (Runtime: RuntimeApi, expression: string): Promise<EvaluateScriptResult> {
        let attempts = 0;
        let result;
        let exceptionDetails;
        let error;

        while (attempts++ < SELECTOR_MAX_EXECUTE_COUNT) {
            ({ result, exceptionDetails, error } = await this.evaluateScript(Runtime, expression));

            if (error && error.response.code === EXECUTION_CTX_WAS_DESTROYED_CODE)
                continue;

            break;
        }

        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        return { result, exceptionDetails, error } as EvaluateScriptResult;
    }

    private static _getPropertyByName (properties: PropertyPreview[], name: string): string {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return properties.find(prop => prop.name === name)!.value!;
    }

    private static _throwException (details: ExceptionDetails, command: ExecuteClientFunctionCommandBase, callsite: CallsiteRecord): never {
        const exception = details.exception;

        if (exception) {
            const className  = exception.className;
            const properties = exception.preview?.properties as PropertyPreview[];

            if (className === Errors.UncaughtErrorInCustomDOMPropertyCode.name) {
                throw new Errors.UncaughtErrorInCustomDOMPropertyCode(command.instantiationCallsiteName,
                    ClientFunctionExecutor._getPropertyByName(properties, 'errMsg'),
                    ClientFunctionExecutor._getPropertyByName(properties, 'property'),
                    callsite);
            }
            else if (className === Errors.CannotObtainInfoForElementSpecifiedBySelectorError.name) {
                throw new Errors.CannotObtainInfoForElementSpecifiedBySelectorError(callsite, {
                    apiFnChain: command.apiFnChain,
                    apiFnIndex: parseInt(ClientFunctionExecutor._getPropertyByName(properties, 'apiFnIndex'), 10),
                });
            }
            else if (className === Errors.ActionElementNotFoundError.name) {
                throw new Errors.ActionElementNotFoundError(callsite, {
                    apiFnChain: command.apiFnChain,
                    apiFnIndex: parseInt(ClientFunctionExecutor._getPropertyByName(properties, 'apiFnIndex'), 10),
                });
            }
            else if (className === Errors.DomNodeClientFunctionResultError.name)
                throw new Errors.DomNodeClientFunctionResultError(command.instantiationCallsiteName, callsite);
            else if (className === Errors.InvalidSelectorResultError.name)
                throw new Errors.InvalidSelectorResultError(callsite);
            else if (className === Errors.ActionElementIsInvisibleError.name)
                throw new Errors.ActionElementIsInvisibleError(callsite);
        }

        throw new Errors.UncaughtErrorInClientFunctionCode(command.instantiationCallsiteName, details.text, callsite);
    }

    public async executeClientFunction (Runtime: RuntimeApi, command: ExecuteClientFunctionCommand, callsite: CallsiteRecord): Promise<object> {
        const expression = `${PROXYLESS_SCRIPT}.executeClientFunctionCommand(${JSON.stringify(command)});`;

        const { result, exceptionDetails, error } = await this.evaluateScript(Runtime, expression);

        if (error) {
            if (error.response.code === EXECUTION_CTX_WAS_DESTROYED_CODE)
                throw new Errors.ClientFunctionExecutionInterruptionError(command.instantiationCallsiteName, callsite);

            throw error;
        }

        if (exceptionDetails)
            ClientFunctionExecutor._throwException(exceptionDetails, command, callsite);

        return JSON.parse(result!.value); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    public async executeSelector <T extends SelectorSnapshotArgs | SelectorNodeArgs> (args: T): Promise<T extends SelectorNodeArgs ? string : object> {
        const { Runtime, command, callsite, selectorTimeout, errTypes } = args;

        const expression = `${PROXYLESS_SCRIPT}.executeSelectorCommand(${JSON.stringify(command)}, ${selectorTimeout}, ${Date.now()},
                            ${'DOM' in args}, ${JSON.stringify(errTypes)});`;

        const { result, exceptionDetails, error } = await this._evaluateScriptWithReloadPageIgnore(Runtime, expression);

        if (error)
            throw error;

        if (exceptionDetails)
            ClientFunctionExecutor._throwException(exceptionDetails, command, callsite);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return 'DOM' in args ? result!.objectId : JSON.parse(result!.value);
    }

    public async executeSelectorAndGetNode (args: SelectorNodeArgs): Promise<DOM.Node> {
        const objectId = await this.executeSelector(args);
        const response = await args.DOM.describeNode({ objectId });

        return response.node;
    }

    public setupFramesWatching (Runtime: RuntimeApi): void {
        Runtime.on('executionContextCreated', (event: ExecutionContextCreatedEvent) => {
            if (!event.context.auxData?.frameId)
                return;

            this._frameExecutionContexts.set(event.context.auxData.frameId, event.context.id);
        });

        Runtime.on('executionContextDestroyed', (event: ExecutionContextDestroyedEvent) => {
            for (const [frameId, executionContextId] of this._frameExecutionContexts.entries()) {
                if (executionContextId === event.executionContextId)
                    this._frameExecutionContexts.delete(frameId);
            }
        });

        Runtime.on('executionContextsCleared', () => {
            this._currentFrameId = '';
            this._frameExecutionContexts.clear();
        });
    }

    public setCurrentFrameId (frameId: string): void {
        this._currentFrameId = frameId;
    }
}
