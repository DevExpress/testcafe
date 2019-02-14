import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';

export function optionValueToRegExp (name, value) {
    if (value === void 0)
        return value;

    try {
        return new RegExp(value);
    }
    catch (err) {
        throw new GeneralError(MESSAGE.optionValueIsNotValidRegExp, name);
    }
}

export function optionValueToKeyValue (name, value) {
    if (value === void 0)
        return value;

    if (typeof value === 'object')
        return value;

    const keyValue = value.split(',').reduce((obj, pair) => {
        const [key, val] = pair.split('=');

        if (!key || !val)
            throw new GeneralError(MESSAGE.optionValueIsNotValidKeyValue, name);

        obj[key] = val;
        return obj;
    }, {});

    if (Object.keys(keyValue).length === 0)
        throw new GeneralError(MESSAGE.optionValueIsNotValidKeyValue, name);

    return keyValue;
}
