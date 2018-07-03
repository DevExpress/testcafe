'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _apiBased = require('../../api-based');

var _apiBased2 = _interopRequireDefault(_apiBased);

var _compiler = require('../es-next/compiler');

var _compiler2 = _interopRequireDefault(_compiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RENAMED_DEPENDENCIES_MAP = new _map2.default([['testcafe', _apiBased2.default.EXPORTABLE_LIB_PATH]]);

var TypeScriptTestFileCompiler = function (_APIBasedTestFileComp) {
    (0, _inherits3.default)(TypeScriptTestFileCompiler, _APIBasedTestFileComp);

    function TypeScriptTestFileCompiler() {
        (0, _classCallCheck3.default)(this, TypeScriptTestFileCompiler);
        return (0, _possibleConstructorReturn3.default)(this, _APIBasedTestFileComp.apply(this, arguments));
    }

    TypeScriptTestFileCompiler._getTypescriptOptions = function _getTypescriptOptions() {
        // NOTE: lazy load the compiler
        var ts = require('typescript');

        return {
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            allowJs: true,
            pretty: true,
            inlineSourceMap: true,
            noImplicitAny: false,
            module: ts.ModuleKind.CommonJS,
            target: 2 /* ES6 */
            , lib: ['lib.es6.d.ts'],
            baseUrl: __dirname,
            paths: { testcafe: ['../../../../../ts-defs/index.d.ts'] },
            suppressOutputPathCheck: true,
            skipLibCheck: true
        };
    };

    TypeScriptTestFileCompiler._reportErrors = function _reportErrors(diagnostics) {
        // NOTE: lazy load the compiler
        var ts = require('typescript');
        var errMsg = 'TypeScript compilation failed.\n';

        diagnostics.forEach(function (d) {
            var file = d.file;

            var _file$getLineAndChara = file.getLineAndCharacterOfPosition(d.start),
                line = _file$getLineAndChara.line,
                character = _file$getLineAndChara.character;

            var message = ts.flattenDiagnosticMessageText(d.messageText, '\n');

            errMsg += file.fileName + ' (' + (line + 1) + ', ' + (character + 1) + '): ' + message + '\n';
        });

        throw new Error(errMsg);
    };

    TypeScriptTestFileCompiler._normalizeFilename = function _normalizeFilename(filename) {
        filename = _path2.default.resolve(filename);

        if (_osFamily2.default.win) filename = filename.toLowerCase();

        return filename;
    };

    TypeScriptTestFileCompiler.prototype._compileCode = function _compileCode(code, filename) {
        var _this2 = this;

        // NOTE: lazy load the compiler
        var ts = require('typescript');

        var normalizedFilename = TypeScriptTestFileCompiler._normalizeFilename(filename);

        if (this.cache[normalizedFilename]) return this.cache[normalizedFilename];

        var opts = TypeScriptTestFileCompiler._getTypescriptOptions();
        var program = ts.createProgram([filename], opts);

        program.getSourceFiles().forEach(function (sourceFile) {
            sourceFile.renamedDependencies = RENAMED_DEPENDENCIES_MAP;
        });

        var diagnostics = ts.getPreEmitDiagnostics(program);

        if (diagnostics.length) TypeScriptTestFileCompiler._reportErrors(diagnostics);

        // NOTE: The first argument of emit() is a source file to be compiled. If it's undefined, all files in
        // <program> will be compiled. <program> contains a file specified in createProgram() plus all its dependencies.
        // This mode is much faster than compiling files one-by-one, and it is used in the tsc CLI compiler.
        program.emit(void 0, function (outputName, result, writeBOM, onError, sources) {
            var sourcePath = TypeScriptTestFileCompiler._normalizeFilename(sources[0].fileName);

            _this2.cache[sourcePath] = result;
        });

        return this.cache[normalizedFilename];
    };

    TypeScriptTestFileCompiler.prototype._getRequireCompilers = function _getRequireCompilers() {
        var _this3 = this;

        return {
            '.ts': function ts(code, filename) {
                return _this3._compileCode(code, filename);
            },
            '.js': function js(code, filename) {
                return _compiler2.default.prototype._compileCode.call(_this3, code, filename);
            }
        };
    };

    TypeScriptTestFileCompiler.prototype.getSupportedExtension = function getSupportedExtension() {
        return '.ts';
    };

    return TypeScriptTestFileCompiler;
}(_apiBased2.default);

exports.default = TypeScriptTestFileCompiler;
module.exports = exports['default'];