'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.isThennable = isThennable;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isThennable(target) {
    return target && (typeof target === 'undefined' ? 'undefined' : (0, _typeof3.default)(target)) === 'object' && 'then' in target && typeof target.then === 'function';
}