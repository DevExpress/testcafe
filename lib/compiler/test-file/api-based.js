'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _path = require('path');

var _fs = require('fs');

var _stripBom = require('strip-bom');

var _stripBom2 = _interopRequireDefault(_stripBom);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _testFile = require('../../api/structure/test-file');

var _testFile2 = _interopRequireDefault(_testFile);

var _fixture = require('../../api/structure/fixture');

var _fixture2 = _interopRequireDefault(_fixture);

var _test = require('../../api/structure/test');

var _test2 = _interopRequireDefault(_test);

var _runtime = require('../../errors/runtime');

var _stackCleaningHook = require('../../errors/stack-cleaning-hook');

var _stackCleaningHook2 = _interopRequireDefault(_stackCleaningHook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CWD = process.cwd();

var EXPORTABLE_LIB_PATH = (0, _path.join)(__dirname, '../../api/exportable-lib');

var FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|`)/;
var TEST_RE = /(^|;|\s+)test\s*(\.|\()/;

var Module = module.constructor;

var APIBasedTestFileCompilerBase = function (_TestFileCompilerBase) {
    (0, _inherits3.default)(APIBasedTestFileCompilerBase, _TestFileCompilerBase);

    function APIBasedTestFileCompilerBase() {
        (0, _classCallCheck3.default)(this, APIBasedTestFileCompilerBase);

        var _this = (0, _possibleConstructorReturn3.default)(this, _TestFileCompilerBase.call(this));

        _this.cache = (0, _create2.default)(null);
        _this.origRequireExtensions = (0, _create2.default)(null);
        return _this;
    }

    APIBasedTestFileCompilerBase._getNodeModulesLookupPath = function _getNodeModulesLookupPath(filename) {
        var dir = (0, _path.dirname)(filename);

        return Module._nodeModulePaths(dir);
    };

    APIBasedTestFileCompilerBase._isNodeModulesDep = function _isNodeModulesDep(filename) {
        return (0, _path.relative)(CWD, filename).split(_path.sep).indexOf('node_modules') >= 0;
    };

    APIBasedTestFileCompilerBase._execAsModule = function _execAsModule(code, filename) {
        var mod = new Module(filename, module.parent);

        mod.filename = filename;
        mod.paths = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

        mod._compile(code, filename);
    };

    APIBasedTestFileCompilerBase.prototype._compileCode = function _compileCode() /* code, filename */{
        throw new Error('Not implemented');
    };

    APIBasedTestFileCompilerBase.prototype._getRequireCompilers = function _getRequireCompilers() {
        throw new Error('Not implemented');
    };

    APIBasedTestFileCompilerBase.prototype._setupRequireHook = function _setupRequireHook(testFile) {
        var _this2 = this;

        var requireCompilers = this._getRequireCompilers();

        this.origRequireExtensions = (0, _create2.default)(null);

        (0, _keys2.default)(requireCompilers).forEach(function (ext) {
            var origExt = require.extensions[ext];

            _this2.origRequireExtensions[ext] = origExt;

            require.extensions[ext] = function (mod, filename) {
                // NOTE: remove global API so that it will be unavailable for the dependencies
                _this2._removeGlobalAPI();

                if (APIBasedTestFileCompilerBase._isNodeModulesDep(filename)) origExt(mod, filename);else {
                    var code = (0, _fs.readFileSync)(filename).toString();
                    var compiledCode = requireCompilers[ext]((0, _stripBom2.default)(code), filename);

                    mod.paths = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

                    mod._compile(compiledCode, filename);
                }

                _this2._addGlobalAPI(testFile);
            };
        });
    };

    APIBasedTestFileCompilerBase.prototype._removeRequireHook = function _removeRequireHook() {
        var _this3 = this;

        (0, _keys2.default)(this.origRequireExtensions).forEach(function (ext) {
            require.extensions[ext] = _this3.origRequireExtensions[ext];
        });
    };

    APIBasedTestFileCompilerBase.prototype._compileCodeForTestFile = function _compileCodeForTestFile(code, filename) {
        var compiledCode = null;

        _stackCleaningHook2.default.enabled = true;

        try {
            compiledCode = this._compileCode(code, filename);
        } catch (err) {
            throw new _runtime.TestCompilationError(_stackCleaningHook2.default.cleanError(err));
        } finally {
            _stackCleaningHook2.default.enabled = false;
        }

        return compiledCode;
    };

    APIBasedTestFileCompilerBase.prototype._addGlobalAPI = function _addGlobalAPI(testFile) {
        Object.defineProperty(global, 'fixture', {
            get: function get() {
                return new _fixture2.default(testFile);
            },
            configurable: true
        });

        Object.defineProperty(global, 'test', {
            get: function get() {
                return new _test2.default(testFile);
            },
            configurable: true
        });
    };

    APIBasedTestFileCompilerBase.prototype._removeGlobalAPI = function _removeGlobalAPI() {
        delete global.fixture;
        delete global.test;
    };

    APIBasedTestFileCompilerBase.prototype.compile = function compile(code, filename) {
        var compiledCode = this._compileCodeForTestFile(code, filename);
        var testFile = new _testFile2.default(filename);

        this._addGlobalAPI(testFile);

        _stackCleaningHook2.default.enabled = true;

        this._setupRequireHook(testFile);

        try {
            APIBasedTestFileCompilerBase._execAsModule(compiledCode, filename);
        } catch (err) {
            // HACK: workaround for the `instanceof` problem
            // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
            if (err.constructor !== _runtime.APIError) throw new _runtime.TestCompilationError(_stackCleaningHook2.default.cleanError(err));

            throw err;
        } finally {
            this._removeRequireHook();
            _stackCleaningHook2.default.enabled = false;

            this._removeGlobalAPI();
        }

        return testFile.getTests();
    };

    APIBasedTestFileCompilerBase.prototype._hasTests = function _hasTests(code) {
        return FIXTURE_RE.test(code) && TEST_RE.test(code);
    };

    APIBasedTestFileCompilerBase.prototype.cleanUp = function cleanUp() {
        this.cache = {};
    };

    (0, _createClass3.default)(APIBasedTestFileCompilerBase, null, [{
        key: 'EXPORTABLE_LIB_PATH',
        get: function get() {
            return EXPORTABLE_LIB_PATH;
        }
    }]);
    return APIBasedTestFileCompilerBase;
}(_base2.default);

exports.default = APIBasedTestFileCompilerBase;
module.exports = exports['default'];