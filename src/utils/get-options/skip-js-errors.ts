import baseGetOptions from './base';
import SKIP_JS_ERRORS_OPTION_NAMES from '../../configuration/skip-js-errors-option-names';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';

function _isSkipJsOption (option: string): option is SKIP_JS_ERRORS_OPTION_NAMES {
    return Object.values(SKIP_JS_ERRORS_OPTION_NAMES).includes(option as SKIP_JS_ERRORS_OPTION_NAMES);
}

export function validateSkipJsErrorsOptionsObject (options: Dictionary<unknown> | SkipJsErrorsOptions, optionName: string, ErrorCtor: any): void {
    if (Object.keys(options).some(key => !_isSkipJsOption(key)))
        throw new ErrorCtor(RUNTIME_ERRORS.invalidSkipJsErrorsOption, optionName);
}

export async function getSkipJsErrorsOptions (optionName: string, options: string | boolean | Dictionary<string | RegExp>): Promise<Dictionary<RegExp|string> | boolean> {
    if (typeof options === 'boolean')
        return options;

    const parsedOptions = await baseGetOptions(options as Dictionary<string>, {
        async onOptionParsed (key: string, value: string | RegExp) {
            if (!key || !value)
                throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

            return value;
        },
    });

    validateSkipJsErrorsOptionsObject(parsedOptions, optionName, GeneralError);

    return parsedOptions;
}
