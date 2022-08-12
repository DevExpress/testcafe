import { Dictionary } from '../../configuration/interfaces';
import { validateSkipJsErrorsOptions } from '../../utils/get-options/skip-js-errors';
import { parseRegExpString } from '../../utils/make-reg-exp';

export function assertSkipJsErrorsOptions (options: Dictionary<any>, callsiteName: string): void {
    validateSkipJsErrorsOptions(options, callsiteName);
}

export function prepareSkipJsErrorsOptions (opts: SkipJsErrorsOptions): SkipJsErrorsOptions {
    opts.message = parseRegExpString(opts.message);
    opts.stack   = parseRegExpString(opts.stack);
    opts.pageUrl = parseRegExpString(opts.pageUrl);

    return opts;
}
