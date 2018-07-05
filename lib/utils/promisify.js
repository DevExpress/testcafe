'use strict';

exports.__esModule = true;

exports.default = function (fn) {
    return (0, _pify2.default)(fn, _pinkie2.default);
};

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];