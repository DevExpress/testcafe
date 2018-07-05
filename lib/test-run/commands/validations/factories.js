'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.createIntegerValidator = createIntegerValidator;
exports.createPositiveIntegerValidator = createPositiveIntegerValidator;
exports.createBooleanValidator = createBooleanValidator;
exports.createSpeedValidator = createSpeedValidator;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

function createIntegerValidator(ErrorCtor) {
    return function (name, val) {
        var valType = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

        if (valType !== 'number') throw new ErrorCtor(name, valType);

        var isInteger = !isNaN(val) && isFinite(val) && val === Math.floor(val);

        if (!isInteger) throw new ErrorCtor(name, val);
    };
}

function createPositiveIntegerValidator(ErrorCtor) {
    var integerValidator = createIntegerValidator(ErrorCtor);

    return function (name, val) {
        integerValidator(name, val);

        if (val < 0) throw new ErrorCtor(name, val);
    };
}

function createBooleanValidator(ErrorCtor) {
    return function (name, val) {
        var valType = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

        if (valType !== 'boolean') throw new ErrorCtor(name, valType);
    };
}

function createSpeedValidator(ErrorCtor) {
    return function (name, val) {
        var valType = typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val);

        if (valType !== 'number') throw new ErrorCtor(name, valType);

        if (isNaN(val) || val < 0.01 || val > 1) throw new ErrorCtor(name, val);
    };
}