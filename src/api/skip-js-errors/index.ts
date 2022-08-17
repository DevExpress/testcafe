import { Dictionary, SkipJsErrorsOptions } from '../../configuration/interfaces';
import { parseRegExpString } from '../../utils/make-reg-exp';
import { ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';

export function isSkipJsErrorsCallback (obj: unknown): obj is SkipJsErrorsCallback {
    return obj && typeof obj === 'object' && 'fn' in obj;
}

export function isSkipJsErrorsOptionsObject (obj: unknown): obj is SkipJsErrorsOptions {
    return obj && typeof obj === 'object' && !isSkipJsErrorsCallback(obj);
}

export function ensureSkipJsErrorsCallbackWrapped (options: boolean | SkipJsErrorsOptions | SkipJsErrorsHandler, dependencies: Dictionary<unknown> = {}): SkipJsErrorsOptions | SkipJsErrorsCallback | boolean {
    if (typeof options === 'function')
        return { fn: options, dependencies };

    return options;
}

export function prepareSkipJsErrorsOptions (options: boolean | SkipJsErrorsOptions | SkipJsErrorsCallback): boolean | ExecuteClientFunctionCommand {
    if (isSkipJsErrorsCallback(options))
        return createSkipJsErrorsClientFunction(options);

    if (isSkipJsErrorsOptionsObject(options))
        return createSkipJsErrorsTemplateFunction(prepareOptionsObject(options));

    return options;
}

function createSkipJsErrorsTemplateFunction (deps: SkipJsErrorsOptions): ExecuteClientFunctionCommand {
    deps.message = deps.message || new RegExp('');
    deps.stack   = deps.stack || new RegExp('');
    deps.pageUrl = deps.pageUrl || new RegExp('');

    const functionBody = `
                let { stack, pageUrl, message } = deps;

                return stack.test(err.stack) && pageUrl.test(err.pageUrl) && message.test(err.message);
        `;

    const func = new Function('err', functionBody) as SkipJsErrorsHandler;

    const callbackWrapper = ensureSkipJsErrorsCallbackWrapped(func, { deps }) as SkipJsErrorsCallback;

    return createSkipJsErrorsClientFunction(callbackWrapper);
}

function createSkipJsErrorsClientFunction ({ fn, dependencies }: SkipJsErrorsCallback): ExecuteClientFunctionCommand {
    const methodName = 'skipJsErrors handler';
    const options    = { dependencies };

    return new ClientFunctionBuilder(fn, options, {
        instantiation: methodName,
        execution:     methodName,
    }).getCommand();
}

function prepareOptionsObject (opts: SkipJsErrorsOptions): SkipJsErrorsOptions {
    opts.message = parseRegExpString(opts.message);
    opts.stack   = parseRegExpString(opts.stack);
    opts.pageUrl = parseRegExpString(opts.pageUrl);

    return opts;
}
