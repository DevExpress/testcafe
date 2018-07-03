'use strict';

exports.__esModule = true;
exports.default = makeRegExp;

var _lodash = require('lodash');

function makeRegExp(str) {
    return typeof str === 'string' ? new RegExp((0, _lodash.escapeRegExp)(str)) : str;
}
module.exports = exports['default'];