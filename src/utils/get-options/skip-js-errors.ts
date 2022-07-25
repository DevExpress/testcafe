import baseGetOptions from './base';
import SKIP_JS_ERRORS_OPTION_NAMES from '../../configuration/skip-js-errors-option-names';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';

function _isSkipJsOption (option: string): option is SKIP_JS_ERRORS_OPTION_NAMES {
    return Object.values(SKIP_JS_ERRORS_OPTION_NAMES).includes(option as SKIP_JS_ERRORS_OPTION_NAMES);
}

export function validateSkipJsErrorsOptions (options: Dictionary<string | number>, optionName: string): void {
    if (Object.keys(options).some(key => !_isSkipJsOption(key)))
        throw new GeneralError(RUNTIME_ERRORS.invalidSkipJsErrorsOption, optionName);
}

export async function getSkipJsErrorsOptions (optionName: string, options: string | boolean | Dictionary<string>): Promise<Dictionary<string> | boolean> {
    if (typeof options === 'boolean')
        return options;

    const parsedOptions = await baseGetOptions(options, {
        async onOptionParsed (key: string, value: string) {
            if (!key || !value)
                throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

            return value;
        },
    });

    validateSkipJsErrorsOptions(parsedOptions, optionName);

    return parsedOptions;
}
