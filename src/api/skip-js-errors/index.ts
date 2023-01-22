import {
    Dictionary, SkipJsErrorsCallback, SkipJsErrorsCallbackWithOptionsObject, SkipJsErrorsOptionsObject,
} from '../../configuration/interfaces';
import { parseRegExpString } from '../../utils/make-reg-exp';
import { ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';

const SKIP_JS_ERRORS_OBJECT_FUNCTION = `
                let { stack, pageUrl, message } = deps;

                return stack.test(err.stack) && pageUrl.test(err.pageUrl) && message.test(err.message);
        `;

export function isSkipJsErrorsCallbackWithOptionsObject (obj: unknown): obj is SkipJsErrorsCallbackWithOptionsObject {
    return !!obj && typeof obj === 'object' && 'fn' in obj;
}

export function isSkipJsErrorsOptionsObject (obj: unknown): obj is SkipJsErrorsOptionsObject {
    return !!obj && typeof obj === 'object' && !isSkipJsErrorsCallbackWithOptionsObject(obj);
}

export function ensureSkipJsErrorsCallbackWrapped (options: boolean | SkipJsErrorsOptionsObject | SkipJsErrorsCallback | SkipJsErrorsCallbackWithOptionsObject, dependencies: Dictionary<any> = {}): SkipJsErrorsOptionsObject | SkipJsErrorsCallbackWithOptionsObject | boolean {
    if (typeof options === 'function')
        return wrapSkipJsErrorsCallback(options, dependencies);

    return options;
}

function wrapSkipJsErrorsCallback (options: SkipJsErrorsCallback, dependencies: Dictionary<any>): SkipJsErrorsCallbackWithOptionsObject {
    return { fn: options, dependencies };
}

export function prepareSkipJsErrorsOptions (options: boolean | SkipJsErrorsOptionsObject | SkipJsErrorsCallback | SkipJsErrorsCallbackWithOptionsObject): boolean | ExecuteClientFunctionCommand {
    options = ensureSkipJsErrorsCallbackWrapped(options);

    if (isSkipJsErrorsCallbackWithOptionsObject(options))
        return createSkipJsErrorsCallbackFunction(options);

    if (isSkipJsErrorsOptionsObject(options))
        return createSkipJsErrorsObjectFunction(prepareOptionsObject(options));

    return options;
}

function createSkipJsErrorsObjectFunction (deps: SkipJsErrorsOptionsObject): ExecuteClientFunctionCommand {
    deps.message = deps.message || new RegExp('');
    deps.stack   = deps.stack || new RegExp('');
    deps.pageUrl = deps.pageUrl || new RegExp('');

    const func = new Function('err', SKIP_JS_ERRORS_OBJECT_FUNCTION) as SkipJsErrorsCallback;

    const callbackWrapper = wrapSkipJsErrorsCallback(func, { deps });

    return createSkipJsErrorsCallbackFunction(callbackWrapper);
}

function createSkipJsErrorsCallbackFunction ({ fn, dependencies }: SkipJsErrorsCallbackWithOptionsObject): ExecuteClientFunctionCommand {
    const methodName = 'skipJsErrors handler';
    const options    = { dependencies };

    return new ClientFunctionBuilder(fn, options, {
        instantiation: methodName,
        execution:     methodName,
    }).getCommand();
}

function prepareOptionsObject (opts: SkipJsErrorsOptionsObject): SkipJsErrorsOptionsObject {
    opts.message = parseRegExpString(opts.message);
    opts.stack   = parseRegExpString(opts.stack);
    opts.pageUrl = parseRegExpString(opts.pageUrl);

    return opts;
}
