import baseGetOptions from './base';
import ERROR_MESSAGES from '../../errors/runtime/message';
import { GeneralError } from '../../errors/runtime';


export default async function (optionName, options) {
    const metaOptions = await baseGetOptions(options, {
        skipOptionValueTypeConversion: true,

        async onOptionParsed (key, value) {
            if (!key || !value)
                throw new GeneralError(ERROR_MESSAGES.optionValueIsNotValidKeyValue, optionName);

            return String(value);
        }
    });

    if (Object.keys(metaOptions).length === 0)
        throw new GeneralError(ERROR_MESSAGES.optionValueIsNotValidKeyValue, optionName);

    return metaOptions;
}
