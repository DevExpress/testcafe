import { GeneralError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';

export default function (optionName, value) {
    if (value === void 0)
        return value;

    try {
        return new RegExp(value);
    }
    catch (err) {
        throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidRegExp, optionName);
    }
}
