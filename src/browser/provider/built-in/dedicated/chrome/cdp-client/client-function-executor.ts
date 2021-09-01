import Protocol from 'devtools-protocol';
import { CallsiteRecord } from 'callsite-record';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import RuntimeApi = ProtocolProxyApi.RuntimeApi;
import EvaluateRequest = Protocol.Runtime.EvaluateRequest;
import RemoteObject = Protocol.Runtime.RemoteObject;
import ExceptionDetails = Protocol.Runtime.ExceptionDetails;
import PropertyPreview = Protocol.Runtime.PropertyPreview;
import {
    CannotObtainInfoForElementSpecifiedBySelectorError,
    ClientFunctionExecutionInterruptionError, DomNodeClientFunctionResultError,
    InvalidSelectorResultError, UncaughtErrorInClientFunctionCode,
    UncaughtErrorInCustomDOMPropertyCode,
} from '../../../../../../shared/errors';
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

            if (className === UncaughtErrorInCustomDOMPropertyCode.name) {
                throw new UncaughtErrorInCustomDOMPropertyCode(command.instantiationCallsiteName,
                    ClientFunctionExecutor._getPropertyByName(properties, 'errMsg'),
                    ClientFunctionExecutor._getPropertyByName(properties, 'property'),
                    callsite);
            }
            else if (className === CannotObtainInfoForElementSpecifiedBySelectorError.name) {
                throw new CannotObtainInfoForElementSpecifiedBySelectorError(callsite, {
                    apiFnChain: command.apiFnChain,
                    apiFnIndex: parseInt(ClientFunctionExecutor._getPropertyByName(properties, 'apiFnIndex'), 10),
                });
            }
            else if (className === DomNodeClientFunctionResultError.name)
                throw new DomNodeClientFunctionResultError(command.instantiationCallsiteName, callsite);
            else if (className === InvalidSelectorResultError.name)
                throw new InvalidSelectorResultError(callsite);
        }

        throw new UncaughtErrorInClientFunctionCode(command.instantiationCallsiteName, details.text, callsite);
    }

    public async executeClientFunction (Runtime: RuntimeApi, command: ExecuteClientFunctionCommand, callsite: CallsiteRecord): Promise<object> {
        const expression = `${PROXYLESS_SCRIPT}.executeClientFunctionCommand(${JSON.stringify(command)});`;

        const { result, exceptionDetails, error } = await this.evaluateScript(Runtime, expression);

        if (error) {
            if (error.response.code === EXECUTION_CTX_WAS_DESTROYED_CODE)
                throw new ClientFunctionExecutionInterruptionError(command.instantiationCallsiteName, callsite);

            throw error;
        }

        if (exceptionDetails)
            ClientFunctionExecutor._throwException(exceptionDetails, command, callsite);

        return JSON.parse(result!.value); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    public async executeSelector (Runtime: RuntimeApi, command: ExecuteSelectorCommand, callsite: CallsiteRecord, selectorTimeout: number): Promise<object> {
        const expression = `${PROXYLESS_SCRIPT}.executeSelectorCommand(${JSON.stringify(command)}, ${selectorTimeout}, ${Date.now()});`;

        const { result, exceptionDetails, error } = await this._evaluateScriptWithReloadPageIgnore(Runtime, expression);

        if (error)
            throw error;

        if (exceptionDetails)
            ClientFunctionExecutor._throwException(exceptionDetails, command, callsite);

        return JSON.parse(result!.value); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    public setupFramesWatching (Runtime: RuntimeApi): void {
        Runtime.on('executionContextCreated', (event: Protocol.Runtime.ExecutionContextCreatedEvent) => {
            if (!event.context.auxData?.frameId)
                return;

            this._frameExecutionContexts.set(event.context.auxData.frameId, event.context.id);
        });

        Runtime.on('executionContextDestroyed', (event: Protocol.Runtime.ExecutionContextDestroyedEvent) => {
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
