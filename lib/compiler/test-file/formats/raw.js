'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _runtime = require('../../../errors/runtime');

var _message = require('../../../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _testFile = require('../../../api/structure/test-file');

var _testFile2 = _interopRequireDefault(_testFile);

var _fixture = require('../../../api/structure/fixture');

var _fixture2 = _interopRequireDefault(_fixture);

var _test = require('../../../api/structure/test');

var _test2 = _interopRequireDefault(_test);

var _fromObject = require('../../../test-run/commands/from-object');

var _fromObject2 = _interopRequireDefault(_fromObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RawTestFileCompiler = function (_TestFileCompilerBase) {
    (0, _inherits3.default)(RawTestFileCompiler, _TestFileCompilerBase);

    function RawTestFileCompiler() {
        (0, _classCallCheck3.default)(this, RawTestFileCompiler);
        return (0, _possibleConstructorReturn3.default)(this, _TestFileCompilerBase.apply(this, arguments));
    }

    RawTestFileCompiler._createTestFn = function _createTestFn(commands) {
        var _this2 = this;

        return function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(t) {
                var i, callsite, command;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                i = 0;

                            case 1:
                                if (!(i < commands.length)) {
                                    _context.next = 17;
                                    break;
                                }

                                callsite = commands[i] && commands[i].callsite;
                                command = null;
                                _context.prev = 4;

                                command = (0, _fromObject2.default)(commands[i]);
                                _context.next = 8;
                                return t.testRun.executeCommand(command, callsite);

                            case 8:
                                _context.next = 14;
                                break;

                            case 10:
                                _context.prev = 10;
                                _context.t0 = _context['catch'](4);

                                _context.t0.callsite = callsite;
                                throw _context.t0;

                            case 14:
                                i++;
                                _context.next = 1;
                                break;

                            case 17:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this2, [[4, 10]]);
            }));

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        }();
    };

    RawTestFileCompiler._assignCommonTestingUnitProperties = function _assignCommonTestingUnitProperties(src, dest) {
        if (src.pageUrl) dest.page(src.pageUrl);

        if (src.authCredentials) dest.httpAuth(src.authCredentials);

        /* eslint-disable no-unused-expressions */
        if (src.only) dest.only;

        if (src.skip) dest.skip;

        if (src.disablePageReloads) dest.disablePageReloads;

        if (src.enablePageReloads) dest.enablePageReloads;
        /* eslint-enable no-unused-expressions */
    };

    RawTestFileCompiler._addTest = function _addTest(testFile, src) {
        var test = new _test2.default(testFile);

        test(src.name, RawTestFileCompiler._createTestFn(src.commands));

        RawTestFileCompiler._assignCommonTestingUnitProperties(src, test);

        if (src.beforeCommands) test.before(RawTestFileCompiler._createTestFn(src.beforeCommands));

        if (src.afterCommands) test.after(RawTestFileCompiler._createTestFn(src.afterCommands));

        return test;
    };

    RawTestFileCompiler._addFixture = function _addFixture(testFile, src) {
        var fixture = new _fixture2.default(testFile);

        fixture(src.name);

        RawTestFileCompiler._assignCommonTestingUnitProperties(src, fixture);

        if (src.beforeEachCommands) fixture.beforeEach(RawTestFileCompiler._createTestFn(src.beforeEachCommands));

        if (src.afterEachCommands) fixture.afterEach(RawTestFileCompiler._createTestFn(src.afterEachCommands));

        src.tests.forEach(function (testSrc) {
            return RawTestFileCompiler._addTest(testFile, testSrc);
        });
    };

    RawTestFileCompiler.prototype._hasTests = function _hasTests() {
        return true;
    };

    RawTestFileCompiler.prototype.getSupportedExtension = function getSupportedExtension() {
        return '.testcafe';
    };

    RawTestFileCompiler.prototype.compile = function compile(code, filename) {
        var data = null;
        var testFile = new _testFile2.default(filename);

        try {
            data = JSON.parse(code);

            data.fixtures.forEach(function (fixtureSrc) {
                return RawTestFileCompiler._addFixture(testFile, fixtureSrc);
            });

            return testFile.getTests();
        } catch (err) {
            throw new _runtime.GeneralError(_message2.default.cannotParseRawFile, filename, err.toString());
        }
    };

    return RawTestFileCompiler;
}(_base2.default);

exports.default = RawTestFileCompiler;
module.exports = exports['default'];