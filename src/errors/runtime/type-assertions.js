import { isFinite, isRegExp, isNil as isNullOrUndefined } from 'lodash';
import { APIError } from './';
import MESSAGE from './message';

function isNumber (value) {
    return isFinite(value) && typeof value === 'number';
}

function isNonNegativeNumber (value) {
    return isNumber && value >= 0;
}

export function assertNumber (callsiteName, what, value) {
    if (!isNumber(value))
        throw new APIError(callsiteName, MESSAGE.valueIsNotANumber, what, typeof value);
}

export function assertNonNegativeNumber (callsiteName, what, value) {
    if (!isNonNegativeNumber(value)) {
        var valueType = typeof value;
        var actual    = valueType === 'number' ? value : valueType;

        throw new APIError(callsiteName, MESSAGE.valueIsNotANonNegativeNumber, what, actual);
    }
}

export function assertBoolean (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'boolean')
        throw new APIError(callsiteName, MESSAGE.valueIsNotABoolean, what, type);
}

export function assertStringOrRegExp (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'string' && !isRegExp(value))
        throw new APIError(callsiteName, MESSAGE.valueIsNotAStringOrRegExp, what, type);
}

export function assertObject (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'object')
        throw new APIError(callsiteName, MESSAGE.valueIsNotAnObject, what, type);
}

export function assertString (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'string')
        throw new APIError(callsiteName, MESSAGE.valueIsNotAString, what, type);
}

export function assertNonNullObject (callsiteName, what, value) {
    var type = typeof value;

    if (isNullOrUndefined(value) || type !== 'object') {
        var actualVal = value === null ? 'null' : type;

        throw new APIError(callsiteName, MESSAGE.valueIsNotAnObject, what, actualVal);
    }
}

export function assertFunctionOrString (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'string' && type !== 'function')
        throw new APIError(callsiteName, MESSAGE.valueIsNotAFunctionOrString, what, type);
}

export function assertFunctionOrStringOrNumber (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'string' && type !== 'function' && !isNumber(value))
        throw new APIError(callsiteName, MESSAGE.valueIsNotAFunctionOrStringOrNumber, what, type);
}
