import { isFinite as isFiniteNumber, isRegExp, isNil as isNullOrUndefined } from 'lodash';
import { APIError, GeneralError } from './';
import { RUNTIME_ERRORS } from '../types';
import RequestHook from '../../api/request-hooks/hook';

const START_FROM_VOWEL_RE = /^[aeiou]/i;

function getIndefiniteArticle (text) {
    return START_FROM_VOWEL_RE.test(text) ? 'an' : 'a';
}

function isNonNegativeValue (value) {
    return isFiniteNumber(value) && value >= 0;
}

function getNumberTypeActualValueMsg (value, type) {
    if (type !== 'number')
        return type;

    if (Number.isNaN(value))
        return NaN;

    if (!isFiniteNumber(value))
        return Infinity;

    return value;
}

export const is = {
    number: {
        name:              'number',
        predicate:         isFiniteNumber,
        getActualValueMsg: getNumberTypeActualValueMsg
    },

    nonNegativeNumber: {
        name:              'non-negative number',
        predicate:         isNonNegativeValue,
        getActualValueMsg: getNumberTypeActualValueMsg
    },

    nonNegativeNumberString: {
        name:      'non-negative number',
        predicate: value => isNonNegativeValue(parseInt(value, 10)),

        getActualValueMsg: value => {
            const number = parseInt(value, 10);

            return isNaN(number) ? JSON.stringify(value) : number;
        }
    },

    boolean: {
        name:      'boolean',
        predicate: (value, type) => type === 'boolean'
    },

    string: {
        name:      'string',
        predicate: (value, type) => type === 'string'
    },

    function: {
        name:      'function',
        predicate: (value, type) => type === 'function'
    },

    regExp: {
        name:      'regular expression',
        predicate: isRegExp
    },

    array: {
        name:      'array',
        predicate: value => Array.isArray(value)
    },

    nonNullObject: {
        name:              'non-null object',
        predicate:         (value, type) => type === 'object' && !isNullOrUndefined(value),
        getActualValueMsg: (value, type) => isNullOrUndefined(value) ? String(value) : type
    },

    requestHookSubclass: {
        name:      'RequestHook subclass',
        predicate: value => value instanceof RequestHook && value.constructor && value.constructor !== RequestHook
    }
};

export function assertType (types, callsiteName, what, value) {
    types = Array.isArray(types) ? types : [types];

    let pass            = false;
    const actualType      = typeof value;
    let actualMsg       = actualType;
    let expectedTypeMsg = '';
    const last            = types.length - 1;

    types.forEach((type, i) => {
        pass = pass || type.predicate(value, actualType);

        if (type.getActualValueMsg)
            actualMsg = type.getActualValueMsg(value, actualType);

        if (i === 0)
            expectedTypeMsg += type.name;
        else
            expectedTypeMsg += (i === last ? ' or ' + getIndefiniteArticle(type.name) + ' ' : ', ') + type.name;
    });

    if (!pass) {
        throw callsiteName ?
            new APIError(callsiteName, RUNTIME_ERRORS.invalidValueType, what, expectedTypeMsg, actualMsg) :
            new GeneralError(RUNTIME_ERRORS.invalidValueType, what, expectedTypeMsg, actualMsg);
    }
}
