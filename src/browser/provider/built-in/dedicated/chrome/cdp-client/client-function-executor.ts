import Protocol from 'devtools-protocol';
import { CallsiteRecord } from 'callsite-record';
import ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';
import RuntimeApi = ProtocolProxyApi.RuntimeApi;
import EvaluateRequest = Protocol.Runtime.EvaluateRequest;
import RemoteObject = Protocol.Runtime.RemoteObject;
import ExceptionDetails = Protocol.Runtime.ExceptionDetails;
import PropertyPreview = Protocol.Runtime.PropertyPreview;
import DOMApi = ProtocolProxyApi.DOMApi;
import * as SharedErrors from '../../../../../../shared/errors';
import {
    ExecuteClientFunctionCommand,
    ExecuteClientFunctionCommandBase,
    ExecuteSelectorCommand,
} from '../../../../../../test-run/commands/observation';
import { AutomationErrorCtors } from '../../../../../../shared/types';
import ExecutionContext from './execution-context';
import { ServerNode } from './types';
import { describeNode } from './utils';

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
    errCtors: AutomationErrorCtors;
    startTime?: number;
}

interface SelectorNodeArgs extends SelectorSnapshotArgs {
    DOM: DOMApi;
}


const EXECUTION_CTX_WAS_DESTROYED_CODE = -32000;
const SELECTOR_MAX_EXECUTE_COUNT       = 10;
const PROXYLESS_SCRIPT                 = 'window["%proxyless%"]';


export default class ClientFunctionExecutor {
    public async evaluateScript (Runtime: RuntimeApi, expression: string): Promise<EvaluateScriptResult> {
        const script: EvaluateRequest = {
            expression,
            awaitPromise: true,
            contextId:    ExecutionContext.getCurrentContextId(),
        };

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

            if (className === SharedErrors.UncaughtErrorInCustomDOMPropertyCode.name) {
                throw new SharedErrors.UncaughtErrorInCustomDOMPropertyCode(command.instantiationCallsiteName,
                    ClientFunctionExecutor._getPropertyByName(properties, 'errMsg'),
                    ClientFunctionExecutor._getPropertyByName(properties, 'property'),
                    callsite);
            }
            else if (className === SharedErrors.CannotObtainInfoForElementSpecifiedBySelectorError.name) {
                throw new SharedErrors.CannotObtainInfoForElementSpecifiedBySelectorError(callsite, {
                    apiFnChain: command.apiFnChain,
                    apiFnIndex: parseInt(ClientFunctionExecutor._getPropertyByName(properties, 'apiFnIndex'), 10),
                });
            }
            else if (className === SharedErrors.ActionElementNotFoundError.name) {
                throw new SharedErrors.ActionElementNotFoundError(callsite, {
                    apiFnChain: command.apiFnChain,
                    apiFnIndex: parseInt(ClientFunctionExecutor._getPropertyByName(properties, 'apiFnIndex'), 10),
                });
            }
            else if (className === SharedErrors.DomNodeClientFunctionResultError.name)
                throw new SharedErrors.DomNodeClientFunctionResultError(command.instantiationCallsiteName, callsite);
            else if (className === SharedErrors.InvalidSelectorResultError.name)
                throw new SharedErrors.InvalidSelectorResultError(callsite);
            else if (className === SharedErrors.ActionElementIsInvisibleError.name)
                throw new SharedErrors.ActionElementIsInvisibleError(callsite);
        }

        throw new SharedErrors.UncaughtErrorInClientFunctionCode(command.instantiationCallsiteName, details.text, callsite);
    }

    public async executeClientFunction (Runtime: RuntimeApi, command: ExecuteClientFunctionCommand, callsite: CallsiteRecord): Promise<object> {
        const expression = `${PROXYLESS_SCRIPT}.executeClientFunctionCommand(${JSON.stringify(command)});`;

        const { result, exceptionDetails, error } = await this.evaluateScript(Runtime, expression);

        if (error) {
            if (error.response.code === EXECUTION_CTX_WAS_DESTROYED_CODE)
                throw new SharedErrors.ClientFunctionExecutionInterruptionError(command.instantiationCallsiteName, callsite);

            throw error;
        }

        if (exceptionDetails)
            ClientFunctionExecutor._throwException(exceptionDetails, command, callsite);

        return JSON.parse(result!.value); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    public async executeSelector <T extends SelectorSnapshotArgs | SelectorNodeArgs> (args: T): Promise<T extends SelectorNodeArgs ? string : object> {
        const { Runtime, command, callsite, selectorTimeout, errCtors, startTime = Date.now() } = args;

        const returnNodeObjId = 'DOM' in args;
        const expression      = `${PROXYLESS_SCRIPT}.executeSelectorCommand(${JSON.stringify(command)}, ${selectorTimeout}, ${startTime},
                                 ${returnNodeObjId}, ${JSON.stringify(errCtors)});`;

        const { result, exceptionDetails, error } = await this._evaluateScriptWithReloadPageIgnore(Runtime, expression);

        if (error)
            throw error;

        if (exceptionDetails)
            ClientFunctionExecutor._throwException(exceptionDetails, command, callsite);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return returnNodeObjId ? result!.objectId : JSON.parse(result!.value);
    }

    public async getNode (args: SelectorNodeArgs): Promise<ServerNode> {
        const objectId = await this.executeSelector(args);

        return describeNode(args.DOM, objectId);
    }
}
