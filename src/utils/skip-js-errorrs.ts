import {
    Dictionary, SkipJsErrorsCallback, SkipJsErrorsOptions,
} from '../configuration/interfaces';
import ClientFunctionBuilder from '../client-functions/client-function-builder';
import { ExecuteClientFunctionCommand } from '../test-run/commands/observation';
import Replicator from 'replicator';

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

export function encodeSkipJsErrorsOptions (options: SkipJsErrorsOptions): Dictionary<string> {
    const replicator = new Replicator();
    const encoded    = Object.entries(options)
        .reduce((prev: Dictionary<string>, [ key, value ]) => {
            prev[key] = replicator.encode(value);

            return prev;
        }, {});

    return encoded;
}
