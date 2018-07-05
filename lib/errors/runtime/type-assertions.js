'use strict';

exports.__esModule = true;
exports.is = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

exports.assertType = assertType;

var _lodash = require('lodash');

var _ = require('./');

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _hook = require('../../api/request-hooks/hook');

var _hook2 = _interopRequireDefault(_hook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var START_FROM_VOWEL_RE = /^[aeiou]/i;

function getIndefiniteArticle(text) {
    return START_FROM_VOWEL_RE.test(text) ? 'an' : 'a';
}

function isNonNegativeValue(value) {
    return (0, _lodash.isFinite)(value) && value >= 0;
}

function getNumberTypeActualValueMsg(value, type) {
    if (type !== 'number') return type;

    if ((0, _isNan2.default)(value)) return NaN;

    if (!(0, _lodash.isFinite)(value)) return Infinity;

    return value;
}

var is = exports.is = {
    number: {
        name: 'number',
        predicate: _lodash.isFinite,
        getActualValueMsg: getNumberTypeActualValueMsg
    },

    nonNegativeNumber: {
        name: 'non-negative number',
        predicate: isNonNegativeValue,
        getActualValueMsg: getNumberTypeActualValueMsg
    },

    nonNegativeNumberString: {
        name: 'non-negative number',
        predicate: function predicate(value) {
            return isNonNegativeValue(parseInt(value, 10));
        },

        getActualValueMsg: function getActualValueMsg(value) {
            var number = parseInt(value, 10);

            return isNaN(number) ? (0, _stringify2.default)(value) : number;
        }
    },

    boolean: {
        name: 'boolean',
        predicate: function predicate(value, type) {
            return type === 'boolean';
        }
    },

    string: {
        name: 'string',
        predicate: function predicate(value, type) {
            return type === 'string';
        }
    },

    function: {
        name: 'function',
        predicate: function predicate(value, type) {
            return type === 'function';
        }
    },

    regExp: {
        name: 'regular expression',
        predicate: _lodash.isRegExp
    },

    array: {
        name: 'array',
        predicate: function predicate(value) {
            return Array.isArray(value);
        }
    },

    nonNullObject: {
        name: 'non-null object',
        predicate: function predicate(value, type) {
            return type === 'object' && !(0, _lodash.isNil)(value);
        },
        getActualValueMsg: function getActualValueMsg(value, type) {
            return (0, _lodash.isNil)(value) ? String(value) : type;
        }
    },

    requestHookSubclass: {
        name: 'RequestHook subclass',
        predicate: function predicate(value) {
            return value instanceof _hook2.default && value.constructor && value.constructor !== _hook2.default;
        }
    }
};

function assertType(types, callsiteName, what, value) {
    types = Array.isArray(types) ? types : [types];

    var pass = false;
    var actualType = typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value);
    var actualMsg = actualType;
    var expectedTypeMsg = '';
    var last = types.length - 1;

    types.forEach(function (type, i) {
        pass = pass || type.predicate(value, actualType);

        if (type.getActualValueMsg) actualMsg = type.getActualValueMsg(value, actualType);

        if (i === 0) expectedTypeMsg += type.name;else expectedTypeMsg += (i === last ? ' or ' + getIndefiniteArticle(type.name) + ' ' : ', ') + type.name;
    });

    if (!pass) {
        throw callsiteName ? new _.APIError(callsiteName, _message2.default.invalidValueType, what, expectedTypeMsg, actualMsg) : new _.GeneralError(_message2.default.invalidValueType, what, expectedTypeMsg, actualMsg);
    }
}