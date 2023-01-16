import {
    Dictionary, SkipJsErrorsCallback, SkipJsErrorsCallbackWithOptionsObject, SkipJsErrorsOptionsObject,
} from '../../configuration/interfaces';
import { parseRegExpString } from '../../utils/make-reg-exp';
import { ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';

function depsToJsonWithRegExp (deps: SkipJsErrorsOptionsObject): string {
    return `{
        stack: ${deps.stack}, 
        pageUrl: ${deps.pageUrl},
        message: ${deps.message}, 
    }`;
}

function getSkipJSErrorsObjectFunction (deps: SkipJsErrorsOptionsObject, proxyless: boolean): string {
    const dependencies = proxyless ? depsToJsonWithRegExp(deps) : 'deps';

    return `
        let { stack, pageUrl, message } = ${dependencies};

        return stack.test(err.stack) && pageUrl.test(err.pageUrl) && message.test(err.message);
    `;
}

function getSkipJSErrorsDependenciesFunction ({ fn, dependencies }: SkipJsErrorsCallbackWithOptionsObject): string {
    let varDeclaration = '';

    if (dependencies)
        varDeclaration = `const { ${Object.keys(dependencies).join(', ')} } = ${JSON.stringify(dependencies)};`;

    return `
        ${varDeclaration}
        
        return (${fn.toString()})(err);
    `;
}

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

export function prepareSkipJsErrorsOptions (options: boolean | SkipJsErrorsOptionsObject | SkipJsErrorsCallback | SkipJsErrorsCallbackWithOptionsObject, proxyless: boolean): boolean | ExecuteClientFunctionCommand | SkipJsErrorsCallback {
    options = ensureSkipJsErrorsCallbackWrapped(options);

    if (isSkipJsErrorsCallbackWithOptionsObject(options))
        return createSkipJsErrorsCallbackFunction(options, proxyless);

    if (isSkipJsErrorsOptionsObject(options))
        return createSkipJsErrorsObjectFunction(prepareOptionsObject(options), proxyless);

    return options;
}

function createSkipJsErrorsObjectFunction (deps: SkipJsErrorsOptionsObject, proxyless: boolean): ExecuteClientFunctionCommand | SkipJsErrorsCallback {
    deps.message = deps.message || new RegExp('');
    deps.stack   = deps.stack || new RegExp('');
    deps.pageUrl = deps.pageUrl || new RegExp('');

    const func = new Function('err', getSkipJSErrorsObjectFunction(deps, proxyless)) as SkipJsErrorsCallback;

    if (proxyless)
        return func;

    const callbackWrapper = wrapSkipJsErrorsCallback(func, { deps });

    return createSkipJsErrorsCallbackFunction(callbackWrapper, false);
}

function createSkipJsErrorsCallbackFunction ({ fn, dependencies }: SkipJsErrorsCallbackWithOptionsObject, proxyless: boolean): ExecuteClientFunctionCommand | SkipJsErrorsCallback {
    if (proxyless)
        return new Function('err', getSkipJSErrorsDependenciesFunction({ fn, dependencies })) as SkipJsErrorsCallback;

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
