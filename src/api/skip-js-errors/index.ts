import {
    Dictionary, SkipJsErrorsHandler, SkipJsErrorsOptions,
} from '../../configuration/interfaces';
import { validateSkipJsErrorsOptions } from '../../utils/get-options/skip-js-errors';
import { parseRegExpString } from '../../utils/make-reg-exp';
import { APIError } from '../../errors/runtime';
import { ExecuteClientFunctionCommand } from '../../test-run/commands/observation';
import {
    createSkipJsErrorsClientFunction,
    isSkipJsErrorsCallback,
    isSkipJsErrorsOptionsObject,
} from '../../utils/skip-js-errorrs';

export function assertSkipJsErrorsOptions (options: Dictionary<any>, callsiteName: string): void {
    validateSkipJsErrorsOptions(options, callsiteName, APIError);
}

export function ensureSkipJsErrorsCallbackWrapped (options: boolean | SkipJsErrorsOptions | SkipJsErrorsHandler, dependencies: Dictionary<unknown> = {}): SkipJsErrorsOptions | SkipJsErrorsCallback | boolean {
    if (typeof options === 'function')
        return { fn: options, dependencies };

    return options;
}

export function prepareSkipJsErrorsOptions (options: boolean | SkipJsErrorsOptions | SkipJsErrorsCallback): boolean | SkipJsErrorsOptions | ExecuteClientFunctionCommand {
    if (isSkipJsErrorsCallback(options))
        return createSkipJsErrorsClientFunction(options);

    if (isSkipJsErrorsOptionsObject(options))
        return prepareOptions(options);

    return options;
}


function prepareOptions (opts: SkipJsErrorsOptions): SkipJsErrorsOptions {
    opts.message = parseRegExpString(opts.message);
    opts.stack   = parseRegExpString(opts.stack);
    opts.pageUrl = parseRegExpString(opts.pageUrl);

    return opts;
}
