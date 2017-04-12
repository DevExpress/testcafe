'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

exports.default = function (ms) {
    return new _pinkie2.default(function (resolve) {
        setTimeout(resolve, ms);
    });
};

module.exports = exports.default;