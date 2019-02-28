import baseGetOptions from './base';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';


export default async function (optionName, options) {
    const metaOptions = await baseGetOptions(options, {
        skipOptionValueTypeConversion: true,

        async onOptionParsed (key, value) {
            if (!key || !value)
                throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

            return String(value);
        }
    });

    if (Object.keys(metaOptions).length === 0)
        throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

    return metaOptions;
}
