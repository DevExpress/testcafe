"use strict";

exports.__esModule = true;

var _raw = require("babel-runtime/core-js/string/raw");

var _raw2 = _interopRequireDefault(_raw);

exports.default = handleTagArgs;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleTagArgs(firstArg, rest) {
    var _String$raw;

    if (Array.isArray(firstArg) && Array.isArray(firstArg.raw)) return (_String$raw = _raw2.default).call.apply(_String$raw, [null, firstArg].concat(rest));

    return firstArg;
}
module.exports = exports["default"];