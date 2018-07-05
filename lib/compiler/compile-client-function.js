'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

exports.default = compileClientFunction;

var _testcafeHammerhead = require('testcafe-hammerhead');

var _testcafeHammerhead2 = _interopRequireDefault(_testcafeHammerhead);

var _asyncToGenerator = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator2 = _interopRequireDefault(_asyncToGenerator);

var _lodash = require('lodash');

var _loadBabelLibs3 = require('./load-babel-libs');

var _loadBabelLibs4 = _interopRequireDefault(_loadBabelLibs3);

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ANONYMOUS_FN_RE = /^function\s*\*?\s*\(/;
var ES6_OBJ_METHOD_NAME_RE = /^(\S+?)\s*\(/;
var USE_STRICT_RE = /^('|")use strict('|");?/;
var TRAILING_SEMICOLON_RE = /;\s*$/;
var REGENERATOR_FOOTPRINTS_RE = /(_index\d+\.default|_regenerator\d+\.default|regeneratorRuntime)\.wrap\(function _callee\$\(_context\)/;
var ASYNC_TO_GENERATOR_OUTPUT_CODE = (0, _asyncToGenerator2.default)(_lodash.noop).toString();

var babelArtifactPolyfills = {
    'Promise': {
        re: /_promise(\d+)\.default/,
        getCode: function getCode(match) {
            return 'var _promise' + match[1] + ' = { default: Promise };';
        },
        removeMatchingCode: false
    },

    'Object.keys()': {
        re: /_keys(\d+)\.default/,
        getCode: function getCode(match) {
            return 'var _keys' + match[1] + ' = { default: Object.keys };';
        },
        removeMatchingCode: false
    },

    'JSON.stringify()': {
        re: /_stringify(\d+)\.default/,
        getCode: function getCode(match) {
            return 'var _stringify' + match[1] + ' = { default: JSON.stringify };';
        },
        removeMatchingCode: false
    },

    'typeof': {
        re: new RegExp((0, _lodash.escapeRegExp)('var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? ' + 'function (obj) {return typeof obj;} : ' + 'function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol ' + '&& obj !== Symbol.prototype ? "symbol" : typeof obj;};'), 'g'),

        getCode: function getCode() {
            return 'var _typeof = function(obj) { return typeof obj; };';
        },
        removeMatchingCode: true
    }
};

function getBabelOptions() {
    var _loadBabelLibs = (0, _loadBabelLibs4.default)(),
        presetFallback = _loadBabelLibs.presetFallback;

    return {
        presets: [presetFallback],
        sourceMaps: false,
        retainLines: true,
        ast: false,
        babelrc: false,
        highlightCode: false
    };
}

function downgradeES(fnCode) {
    var _loadBabelLibs2 = (0, _loadBabelLibs4.default)(),
        babel = _loadBabelLibs2.babel;

    var opts = getBabelOptions();
    var compiled = babel.transform(fnCode, opts);

    return compiled.code.replace(USE_STRICT_RE, '').trim();
}

function addBabelArtifactsPolyfills(fnCode, dependenciesDefinition) {
    var modifiedFnCode = fnCode;

    var polyfills = (0, _values2.default)(babelArtifactPolyfills).reduce(function (polyfillsCode, polyfill) {
        var match = fnCode.match(polyfill.re);

        if (match) {
            if (polyfill.removeMatchingCode) modifiedFnCode = modifiedFnCode.replace(polyfill.re, '');

            return polyfillsCode + polyfill.getCode(match);
        }

        return polyfillsCode;
    }, '');

    return '(function(){' + dependenciesDefinition + polyfills + ' return ' + modifiedFnCode + '})();';
}

function getDependenciesDefinition(dependencies) {
    return (0, _keys2.default)(dependencies).reduce(function (code, name) {
        return code + ('var ' + name + '=__dependencies$[\'' + name + '\'];');
    }, '');
}

function makeFnCodeSuitableForParsing(fnCode) {
    // NOTE: 'function() {}' -> '(function() {})'
    if (ANONYMOUS_FN_RE.test(fnCode)) return '(' + fnCode + ')';

    // NOTE: 'myFn () {}' -> 'function myFn() {}'
    var match = fnCode.match(ES6_OBJ_METHOD_NAME_RE);

    if (match && match[1] !== 'function') return 'function ' + fnCode;

    return fnCode;
}

function compileClientFunction(fnCode, dependencies, instantiationCallsiteName, compilationCallsiteName) {
    if (fnCode === ASYNC_TO_GENERATOR_OUTPUT_CODE) throw new _runtime.ClientFunctionAPIError(compilationCallsiteName, instantiationCallsiteName, _message2.default.regeneratorInClientFunctionCode);

    fnCode = makeFnCodeSuitableForParsing(fnCode);

    // NOTE: we need to recompile ES6 code for the browser if we are on newer versions of Node.
    fnCode = downgradeES(fnCode);
    fnCode = _testcafeHammerhead2.default.processScript(fnCode, false);

    // NOTE: check compiled code for regenerator injection: we have either generator
    // recompiled in Node.js 4+ for client or async function declared in function code.
    if (REGENERATOR_FOOTPRINTS_RE.test(fnCode)) throw new _runtime.ClientFunctionAPIError(compilationCallsiteName, instantiationCallsiteName, _message2.default.regeneratorInClientFunctionCode);

    if (!TRAILING_SEMICOLON_RE.test(fnCode)) fnCode += ';';

    var dependenciesDefinition = dependencies ? getDependenciesDefinition(dependencies) : '';

    return addBabelArtifactsPolyfills(fnCode, dependenciesDefinition);
}
module.exports = exports['default'];