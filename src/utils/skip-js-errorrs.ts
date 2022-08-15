import {
    SkipJsErrorsCallback, SkipJsErrorsHandler, SkipJsErrorsOptions,
} from '../configuration/interfaces';
import ClientFunctionBuilder from '../client-functions/client-function-builder';
import { ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import { isClientFunctionCommand } from '../test-run/commands/utils';
import { ensureSkipJsErrorsCallbackWrapped } from '../api/skip-js-errors';

export function isSkipJsErrorsCallback (obj: unknown): obj is SkipJsErrorsCallback {
    return obj && typeof obj === 'object' && 'fn' in obj;
}

export function isSkipJsErrorsOptionsObject (obj: unknown): obj is SkipJsErrorsOptions {
    return obj && typeof obj === 'object' && !isSkipJsErrorsCallback(obj) && !isClientFunctionCommand(obj);
}

export function createSkipJsErrorsTemplateFunction (deps: SkipJsErrorsOptions): ExecuteClientFunctionCommand {
    const skipJsErrorObjectParametersFunction = `
                let { stack, pageUrl, message } = deps;
                
                stack   = stack || new RegExp('');
                pageUrl = pageUrl || new RegExp('');
                message = message || new RegExp('');

                return stack.test(err.stack) && pageUrl.test(err.pageUrl) && message.test(err.message);
        `;

    const func = new Function('err', skipJsErrorObjectParametersFunction) as SkipJsErrorsHandler;

    const callbackWrapper = ensureSkipJsErrorsCallbackWrapped(func, { deps }) as SkipJsErrorsCallback;

    return createSkipJsErrorsClientFunction(callbackWrapper);
}

export function createSkipJsErrorsClientFunction ({ fn, dependencies }: SkipJsErrorsCallback): ExecuteClientFunctionCommand {
    const methodName = 'skipJsErrors handler';
    const options    = { dependencies };

    return new ClientFunctionBuilder(fn, options, {
        instantiation: methodName,
        execution:     methodName,
    }).getCommand([]);
}
