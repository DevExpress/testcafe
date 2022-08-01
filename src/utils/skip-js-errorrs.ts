import { SkipJsErrorsCallback } from '../configuration/interfaces';
import ClientFunctionBuilder from '../client-functions/client-function-builder';
import { ExecuteClientFunctionCommand } from '../test-run/commands/observation';

export function isSkipJsErrorsCallback (obj: unknown): obj is SkipJsErrorsCallback {
    return obj && typeof obj === 'object' && 'fn' in obj;
}

export function createSkipJsErrorsClientFunction ({ fn, dependencies }: SkipJsErrorsCallback): ExecuteClientFunctionCommand {
    const methodName = 'skipJsErrors handler';
    const options    = { dependencies };

    return new ClientFunctionBuilder(fn, options, {
        instantiation: methodName,
        execution:     methodName,
    }).getCommand([]);
}
