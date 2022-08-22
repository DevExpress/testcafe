import {
    Dictionary, SkipJsErrorsCallback, SkipJsErrorsCallbackOptions, SkipJsErrorsOptions,
} from '../../configuration/interfaces';
import { parseRegExpString } from '../../utils/make-reg-exp';
import { ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';

const SKIP_JS_ERRORS_OBJECT_FUNCTION = `
                let { stack, pageUrl, message } = deps;

                return stack.test(err.stack) && pageUrl.test(err.pageUrl) && message.test(err.message);
        `;

export function isSkipJsErrorsCallbackOptions (obj: unknown): obj is SkipJsErrorsCallbackOptions {
    return obj && typeof obj === 'object' && 'fn' in obj;
}

export function isSkipJsErrorsOptionsObject (obj: unknown): obj is SkipJsErrorsOptions {
    return obj && typeof obj === 'object' && !isSkipJsErrorsCallbackOptions(obj);
}

export function ensureSkipJsErrorsCallbackWrapped (options: boolean | SkipJsErrorsOptions | SkipJsErrorsCallback | SkipJsErrorsCallbackOptions, dependencies: Dictionary<any> = {}): SkipJsErrorsOptions | SkipJsErrorsCallbackOptions | boolean {
    if (typeof options === 'function')
        return wrapSkipJsErrorsCallback(options, dependencies);

    return options;
}

function wrapSkipJsErrorsCallback (options: SkipJsErrorsCallback, dependencies: Dictionary<any>): SkipJsErrorsCallbackOptions {
    return { fn: options, dependencies };
}

export function prepareSkipJsErrorsOptions (options: boolean | SkipJsErrorsOptions | SkipJsErrorsCallback | SkipJsErrorsCallbackOptions): boolean | ExecuteClientFunctionCommand {
    options = ensureSkipJsErrorsCallbackWrapped(options);

    if (isSkipJsErrorsCallbackOptions(options))
        return createSkipJsErrorsCallbackFunction(options);

    if (isSkipJsErrorsOptionsObject(options))
        return createSkipJsErrorsObjectFunction(prepareOptionsObject(options));

    return options;
}

function createSkipJsErrorsObjectFunction (deps: SkipJsErrorsOptions): ExecuteClientFunctionCommand {
    deps.message = deps.message || new RegExp('');
    deps.stack   = deps.stack || new RegExp('');
    deps.pageUrl = deps.pageUrl || new RegExp('');

    const func = new Function('err', SKIP_JS_ERRORS_OBJECT_FUNCTION) as SkipJsErrorsCallback;

    const callbackWrapper = wrapSkipJsErrorsCallback(func, { deps }) as SkipJsErrorsCallbackOptions;

    return createSkipJsErrorsCallbackFunction(callbackWrapper);
}

function createSkipJsErrorsCallbackFunction ({ fn, dependencies }: SkipJsErrorsCallbackOptions): ExecuteClientFunctionCommand {
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
