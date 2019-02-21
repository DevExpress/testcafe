import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

export function optionValueToRegExp (name, value) {
    if (value === void 0)
        return value;

    try {
        return new RegExp(value);
    }
    catch (err) {
        throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidRegExp, name);
    }
}

export function optionValueToKeyValue (name, value) {
    if (value === void 0 || typeof value === 'object')
        return value;

    if (typeof value !== 'string')
        throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, name);

    const keyValue = value.split(',').reduce((obj, pair) => {
        const [key, val] = pair.split('=');

        if (!key || !val)
            throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, name);

        obj[key] = val;
        return obj;
    }, {});

    if (Object.keys(keyValue).length === 0)
        throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, name);

    return keyValue;
}
