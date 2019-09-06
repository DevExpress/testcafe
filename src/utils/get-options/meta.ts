import baseGetOptions from './base';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';

export default async function (optionName: string, options: string): Promise<Dictionary<string | number | boolean>> {
    const metaOptions = await baseGetOptions(options, {
        skipOptionValueTypeConversion: true,

        async onOptionParsed (key: string, value: string) {
            if (!key || !value)
                throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

            return String(value);
        }
    });

    if (Object.keys(metaOptions).length === 0)
        throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

    return metaOptions;
}
