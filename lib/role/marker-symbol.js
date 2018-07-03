'use strict';

exports.__esModule = true;

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global Symbol*/

// HACK: used to validate that UseRoleCommand argument value
// is a Role. With the marker symbol approach we can safely use
// commands in Role without circular reference.
exports.default = (0, _symbol2.default)('testRun');
module.exports = exports['default'];