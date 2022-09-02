import baseGetOptions from './base';
import { SKIP_JS_ERRORS_CALLBACK_WITH_OPTIONS_OPTION_NAMES, SKIP_JS_ERRORS_OPTIONS_OBJECT_OPTION_NAMES } from '../../configuration/skip-js-errors-option-names';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';
import { isSkipJsErrorsCallbackWithOptionsObject, isSkipJsErrorsOptionsObject } from '../../api/skip-js-errors';

export function validateSkipJsErrorsOptionValue (options: boolean | Dictionary<unknown> | SkipJsErrorsOptionsObject | SkipJsErrorsCallback | SkipJsErrorsCallbackWithOptionsObject, ErrorCtor: any): void {
    if (isSkipJsErrorsCallbackWithOptionsObject(options))
        validateSkipJsErrorsCallbackWithOptionsObject(options, ErrorCtor);

    else if (isSkipJsErrorsOptionsObject(options))
        validateSkipJsErrorsOptionsObject(options, ErrorCtor);

    return void 0;
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

    validateSkipJsErrorsOptionsObject(parsedOptions, GeneralError);

    return parsedOptions;
}

function _isSkipJsErrorsOptionsObjectOption (option: string): option is SKIP_JS_ERRORS_OPTIONS_OBJECT_OPTION_NAMES {
    return Object.values(SKIP_JS_ERRORS_OPTIONS_OBJECT_OPTION_NAMES).includes(option as SKIP_JS_ERRORS_OPTIONS_OBJECT_OPTION_NAMES);
}

function _isSkipJsErrorsCallbackWithOptionsOption (option: string): option is SKIP_JS_ERRORS_CALLBACK_WITH_OPTIONS_OPTION_NAMES {
    return Object.values(SKIP_JS_ERRORS_CALLBACK_WITH_OPTIONS_OPTION_NAMES).includes(option as SKIP_JS_ERRORS_CALLBACK_WITH_OPTIONS_OPTION_NAMES);
}

function validateSkipJsErrorsOptionsObject (options: Dictionary<unknown> | SkipJsErrorsOptionsObject, ErrorCtor: any): void {
    for (const key in options) {
        if (!_isSkipJsErrorsOptionsObjectOption(key))
            throw new ErrorCtor(RUNTIME_ERRORS.invalidSkipJsErrorsOptionsObjectProperty, key);
    }
}

function validateSkipJsErrorsCallbackWithOptionsObject (options: Dictionary<unknown> | SkipJsErrorsCallbackWithOptionsObject, ErrorCtor: any): void {
    for (const key in options) {
        if (!_isSkipJsErrorsCallbackWithOptionsOption(key))
            throw new ErrorCtor(RUNTIME_ERRORS.invalidSkipJsErrorsCallbackWithOptionsProperty, key);
    }
}
