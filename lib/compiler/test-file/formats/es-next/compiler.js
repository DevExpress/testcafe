'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _loadBabelLibs3 = require('../../../load-babel-libs');

var _loadBabelLibs4 = _interopRequireDefault(_loadBabelLibs3);

var _apiBased = require('../../api-based');

var _apiBased2 = _interopRequireDefault(_apiBased);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BABEL_RUNTIME_RE = /^babel-runtime(\\|\/|$)/;
var FLOW_MARKER_RE = /^\s*\/\/\s*@flow\s*\n|^\s*\/\*\s*@flow\s*\*\//;

var ESNextTestFileCompiler = function (_APIBasedTestFileComp) {
    (0, _inherits3.default)(ESNextTestFileCompiler, _APIBasedTestFileComp);

    function ESNextTestFileCompiler() {
        (0, _classCallCheck3.default)(this, ESNextTestFileCompiler);
        return (0, _possibleConstructorReturn3.default)(this, _APIBasedTestFileComp.apply(this, arguments));
    }

    ESNextTestFileCompiler.getBabelOptions = function getBabelOptions(filename, code) {
        var _loadBabelLibs = (0, _loadBabelLibs4.default)(),
            presetStage2 = _loadBabelLibs.presetStage2,
            presetFlow = _loadBabelLibs.presetFlow,
            transformRuntime = _loadBabelLibs.transformRuntime,
            transformClassProperties = _loadBabelLibs.transformClassProperties,
            presetEnv = _loadBabelLibs.presetEnv;

        // NOTE: passPrePreset and complex presets is a workaround for https://github.com/babel/babel/issues/2877
        // Fixes https://github.com/DevExpress/testcafe/issues/969


        return {
            passPerPreset: true,
            presets: [{
                passPerPreset: false,
                presets: [{ plugins: [transformRuntime] }, presetStage2, presetEnv]
            }, FLOW_MARKER_RE.test(code) ? {
                passPerPreset: false,
                presets: [{ plugins: [transformClassProperties] }, presetFlow]
            } : {}],
            filename: filename,
            retainLines: true,
            sourceMaps: 'inline',
            ast: false,
            babelrc: false,
            highlightCode: false,

            resolveModuleSource: function resolveModuleSource(source) {
                if (source === 'testcafe') return _apiBased2.default.EXPORTABLE_LIB_PATH;

                if (BABEL_RUNTIME_RE.test(source)) {
                    try {
                        return require.resolve(source);
                    } catch (err) {
                        return source;
                    }
                }

                return source;
            }
        };
    };

    ESNextTestFileCompiler.prototype._compileCode = function _compileCode(code, filename) {
        var _loadBabelLibs2 = (0, _loadBabelLibs4.default)(),
            babel = _loadBabelLibs2.babel;

        if (this.cache[filename]) return this.cache[filename];

        var opts = ESNextTestFileCompiler.getBabelOptions(filename, code);
        var compiled = babel.transform(code, opts);

        this.cache[filename] = compiled.code;

        return compiled.code;
    };

    ESNextTestFileCompiler.prototype._getRequireCompilers = function _getRequireCompilers() {
        var _this2 = this;

        return { '.js': function js(code, filename) {
                return _this2._compileCode(code, filename);
            } };
    };

    ESNextTestFileCompiler.prototype.getSupportedExtension = function getSupportedExtension() {
        return '.js';
    };

    return ESNextTestFileCompiler;
}(_apiBased2.default);

exports.default = ESNextTestFileCompiler;
module.exports = exports['default'];