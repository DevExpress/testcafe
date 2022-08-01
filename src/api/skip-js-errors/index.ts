import { Dictionary } from '../../configuration/interfaces';
import { validateSkipJsErrorsOptions } from '../../utils/get-options/skip-js-errors';

export function assertSkipJsErrorsOptions (options: Dictionary<any>, callsiteName: string): void {
    validateSkipJsErrorsOptions(options, callsiteName);
}

export function prepareSkipJsErrorsOptions (opts: SkipJsErrorsOptions): SkipJsErrorsOptions {
    opts.message = initStringOrRegExpOption(opts.message);
    opts.stack   = initStringOrRegExpOption(opts.stack);
    opts.pageUrl = initStringOrRegExpOption(opts.pageUrl);

    return opts;
}

function initStringOrRegExpOption (opt?: string | RegExp): string | undefined {
    return opt instanceof RegExp ? opt.source : opt;
}
