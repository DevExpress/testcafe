import baseGetOptions from './base';
import QUARANTINE_OPTION_NAMES from '../../configuration/quarantine-option-names';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';


function isQuarantineOption (option: string): option is QUARANTINE_OPTION_NAMES {
    return Object.values(QUARANTINE_OPTION_NAMES).includes(option as QUARANTINE_OPTION_NAMES);
}

function validateQuarantineOptions (options: Dictionary<string | number> ): void {
    const { retryCount, passCount } = options;

    if (!passCount && retryCount < 3)
        throw new GeneralError(RUNTIME_ERRORS.invalidRetryCountValue);
    else if (passCount > retryCount)
        throw new GeneralError(RUNTIME_ERRORS.invalidRetryCountValue);
}

export default async function (optionName: string, options: string | Dictionary<string | number>): Promise<Dictionary<number>> {
    const parsedOptions = await baseGetOptions(options, {
        skipOptionValueTypeConversion: true,

        async onOptionParsed (key: string, value: string) {
            if (!key || !value)
                throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

            return Number(value);
        }
    });

    if (Object.keys(parsedOptions).some(key => !isQuarantineOption(key)))
        throw new GeneralError(RUNTIME_ERRORS.invalidQuarantineOption, optionName);

    validateQuarantineOptions(parsedOptions);

    return parsedOptions;
}
