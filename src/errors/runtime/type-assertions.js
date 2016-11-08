import { isFinite, isRegExp, isNil as isNullOrUndefined } from 'lodash';
import { APIError } from './';
import MESSAGE from './message';

function isNonNegativeNumber (value) {
    return isFinite(value) && value >= 0;
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

export function assertFunctionOrStringOnNonNegativeNumber (callsiteName, what, value) {
    var type = typeof value;

    if (type !== 'string' && type !== 'function' && (type !== 'number' || !isNonNegativeNumber(value)))
        throw new APIError(callsiteName, MESSAGE.valueIsNotAFunctionOrStringOrNonNegativeNumber, what, type);
}
