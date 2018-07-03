'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _stripBom = require('strip-bom');

var _stripBom2 = _interopRequireDefault(_stripBom);

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

var _testcafeLegacyApi = require('testcafe-legacy-api');

var _testcafeHammerhead = require('testcafe-hammerhead');

var _testcafeHammerhead2 = _interopRequireDefault(_testcafeHammerhead);

var _compiler = require('./test-file/formats/es-next/compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _compiler3 = require('./test-file/formats/typescript/compiler');

var _compiler4 = _interopRequireDefault(_compiler3);

var _raw = require('./test-file/formats/raw');

var _raw2 = _interopRequireDefault(_raw);

var _promisifiedFunctions = require('../utils/promisified-functions');

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SOURCE_CHUNK_LENGTH = 1000;

var testFileCompilers = [new _testcafeLegacyApi.Compiler(_testcafeHammerhead2.default.processScript), new _compiler2.default(), new _compiler4.default(), new _raw2.default()];

var Compiler = function () {
    function Compiler(sources) {
        (0, _classCallCheck3.default)(this, Compiler);

        this.sources = sources;

        Compiler._setupSourceMapsSupport();
    }

    Compiler.getSupportedTestFileExtensions = function getSupportedTestFileExtensions() {
        return (0, _lodash.uniq)(testFileCompilers.map(function (c) {
            return c.getSupportedExtension();
        }));
    };

    Compiler._setupSourceMapsSupport = function _setupSourceMapsSupport() {
        _sourceMapSupport2.default.install({
            hookRequire: true,
            handleUncaughtExceptions: false,
            environment: 'node'
        });
    };

    Compiler.prototype._compileTestFile = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(filename) {
            var code, compiler;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            code = null;
                            _context.prev = 1;
                            _context.next = 4;
                            return (0, _promisifiedFunctions.readFile)(filename);

                        case 4:
                            code = _context.sent;
                            _context.next = 10;
                            break;

                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context['catch'](1);
                            throw new _runtime.GeneralError(_message2.default.cantFindSpecifiedTestSource, filename);

                        case 10:

                            code = (0, _stripBom2.default)(code).toString();

                            compiler = (0, _lodash.find)(testFileCompilers, function (c) {
                                return c.canCompile(code, filename);
                            });

                            if (!compiler) {
                                _context.next = 18;
                                break;
                            }

                            _context.next = 15;
                            return compiler.compile(code, filename);

                        case 15:
                            _context.t1 = _context.sent;
                            _context.next = 19;
                            break;

                        case 18:
                            _context.t1 = null;

                        case 19:
                            return _context.abrupt('return', _context.t1);

                        case 20:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[1, 7]]);
        }));

        function _compileTestFile(_x) {
            return _ref.apply(this, arguments);
        }

        return _compileTestFile;
    }();

    Compiler.prototype.getTests = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var _this = this;

            var sourceChunks, tests, compileUnits;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            sourceChunks = (0, _lodash.chunk)(this.sources, SOURCE_CHUNK_LENGTH);
                            tests = [];
                            compileUnits = [];

                            // NOTE: split sources into chunks because the fs module can't read all files
                            // simultaneously if the number of them is too large (several thousands).

                        case 3:
                            if (!sourceChunks.length) {
                                _context2.next = 12;
                                break;
                            }

                            compileUnits = sourceChunks.shift().map(function (filename) {
                                return _this._compileTestFile(filename);
                            });
                            _context2.t0 = tests;
                            _context2.next = 8;
                            return _pinkie2.default.all(compileUnits);

                        case 8:
                            _context2.t1 = _context2.sent;
                            tests = _context2.t0.concat.call(_context2.t0, _context2.t1);
                            _context2.next = 3;
                            break;

                        case 12:

                            testFileCompilers.forEach(function (c) {
                                return c.cleanUp();
                            });

                            tests = (0, _lodash.flattenDeep)(tests).filter(function (test) {
                                return !!test;
                            });

                            return _context2.abrupt('return', tests);

                        case 15:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function getTests() {
            return _ref2.apply(this, arguments);
        }

        return getTests;
    }();

    return Compiler;
}();

exports.default = Compiler;
module.exports = exports['default'];