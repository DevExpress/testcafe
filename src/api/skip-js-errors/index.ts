import { Dictionary } from '../../configuration/interfaces';
import { validateSkipJsErrorsOptions } from '../../utils/get-options/skip-js-errors';
import makeRegExp from '../../utils/make-reg-exp';

export function assertSkipJsErrorsOptions (options: Dictionary<any>, callsiteName: string): void {
    validateSkipJsErrorsOptions(options, callsiteName);
}

export function prepareSkipJsErrorsOptions (opts: SkipJsErrorsOptions): SkipJsErrorsOptions {
    opts.message = makeRegExp(opts.message);
    opts.stack   = makeRegExp(opts.stack);
    opts.pageUrl = makeRegExp(opts.pageUrl);

    return opts;
}
