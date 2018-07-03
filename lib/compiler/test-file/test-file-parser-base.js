'use strict';

exports.__esModule = true;
exports.TestFileParserBase = exports.Test = exports.Fixture = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _promisify = require('../../utils/promisify');

var _promisify2 = _interopRequireDefault(_promisify);

var _util = require('util');

var _runtime = require('../../errors/runtime');

var _message = require('../../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _readFile = (0, _promisify2.default)(_fs2.default.readFile);

var METHODS_SPECIFYING_NAME = ['only', 'skip'];
var COMPUTED_NAME_TEXT_TMP = '<computed name>(line: %s)';

var Fixture = exports.Fixture = function Fixture(name, start, end, loc) {
    (0, _classCallCheck3.default)(this, Fixture);

    this.name = name;
    this.loc = loc;
    this.start = start;
    this.end = end;
    this.tests = [];
};

var Test = exports.Test = function Test(name, start, end, loc) {
    (0, _classCallCheck3.default)(this, Test);

    this.name = name;
    this.loc = loc;
    this.start = start;
    this.end = end;
};

var TestFileParserBase = exports.TestFileParserBase = function () {
    function TestFileParserBase(tokenType) {
        (0, _classCallCheck3.default)(this, TestFileParserBase);

        this.tokenType = tokenType;
    }

    TestFileParserBase.formatComputedName = function formatComputedName(line) {
        return (0, _util.format)(COMPUTED_NAME_TEXT_TMP, line);
    };

    TestFileParserBase.prototype.isAsyncFn = function isAsyncFn() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.getRValue = function getRValue() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.getFunctionBody = function getFunctionBody() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.formatFnData = function formatFnData() /* name, value, token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.analyzeMemberExp = function analyzeMemberExp() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.formatFnArg = function formatFnArg() /* arg */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.getFnCall = function getFnCall() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.getTaggedTemplateExp = function getTaggedTemplateExp() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.analyzeFnCall = function analyzeFnCall() /* token */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.parse = function parse() /* filePath, code */{
        throw new Error('Not implemented');
    };

    TestFileParserBase.prototype.isApiFn = function isApiFn(fn) {
        return fn === 'fixture' || fn === 'test';
    };

    TestFileParserBase.prototype.checkExpDefineTargetName = function checkExpDefineTargetName(type, apiFn) {
        //NOTE: fixture('fixtureName').chainFn or test('testName').chainFn
        var isDirectCall = type === this.tokenType.Identifier;

        //NOTE: fixture.skip('fixtureName'), test.only('testName') etc.
        var isMemberCall = type === this.tokenType.PropertyAccessExpression && METHODS_SPECIFYING_NAME.indexOf(apiFn) > -1;

        //NOTE: fixture.before().after()('fixtureName'), test.before()`testName`.after() etc.
        var isTailCall = type === this.tokenType.CallExpression;

        return isDirectCall || isMemberCall || isTailCall;
    };

    TestFileParserBase.prototype.analyzeToken = function analyzeToken(token) {
        var tokenType = this.tokenType;
        var currTokenType = this.getTokenType(token);

        switch (currTokenType) {
            case tokenType.ExpressionStatement:
            case tokenType.TypeAssertionExpression:
                return this.analyzeToken(token.expression);

            case tokenType.FunctionDeclaration:
            case tokenType.FunctionExpression:
                if (this.isAsyncFn(token)) return null;

                return this.getFunctionBody(token).map(this.analyzeToken, this);

            case tokenType.VariableDeclaration:
                return this.analyzeToken(this.getRValue(token));

            case tokenType.CallExpression:
            case tokenType.PropertyAccessExpression:
            case tokenType.TaggedTemplateExpression:
                return this.analyzeFnCall(token);
        }

        return null;
    };

    TestFileParserBase.prototype.collectTestCafeCalls = function collectTestCafeCalls(astBody) {
        var _this = this;

        var calls = [];

        astBody.forEach(function (token) {
            var callExps = _this.analyzeToken(token);

            if (callExps) calls = calls.concat(callExps);
        });

        return calls;
    };

    TestFileParserBase.prototype.analyze = function analyze(astBody) {
        var fixtures = [];
        var testCafeAPICalls = this.collectTestCafeCalls(astBody);

        testCafeAPICalls.forEach(function (call) {
            if (!call || typeof call.value !== 'string') return;

            if (call.fnName === 'fixture') {
                fixtures.push(new Fixture(call.value, call.start, call.end, call.loc));
                return;
            }

            if (!fixtures.length) return;

            var test = new Test(call.value, call.start, call.end, call.loc);

            fixtures[fixtures.length - 1].tests.push(test);
        });

        return fixtures;
    };

    TestFileParserBase.prototype.readFile = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(filePath) {
            var fileContent;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            fileContent = '';
                            _context.prev = 1;
                            _context.next = 4;
                            return _readFile(filePath, 'utf8');

                        case 4:
                            fileContent = _context.sent;
                            _context.next = 10;
                            break;

                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context['catch'](1);
                            throw new _runtime.GeneralError(_message2.default.cantFindSpecifiedTestSource, filePath);

                        case 10:
                            return _context.abrupt('return', fileContent);

                        case 11:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[1, 7]]);
        }));

        function readFile(_x) {
            return _ref.apply(this, arguments);
        }

        return readFile;
    }();

    TestFileParserBase.prototype.getTestList = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(filePath) {
            var fileContent;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return this.readFile(filePath);

                        case 2:
                            fileContent = _context2.sent;
                            return _context2.abrupt('return', this.parse(fileContent));

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function getTestList(_x2) {
            return _ref2.apply(this, arguments);
        }

        return getTestList;
    }();

    TestFileParserBase.prototype.getTestListFromCode = function getTestListFromCode(code) {
        return this.parse(code);
    };

    return TestFileParserBase;
}();