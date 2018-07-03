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

var _events = require('events');

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _thennable = require('../utils/thennable');

var _testRun = require('../errors/test-run');

var _reExecutablePromise = require('../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _getFn = require('./get-fn');

var _getFn2 = _interopRequireDefault(_getFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ASSERTION_DELAY = 200;

var AssertionExecutor = function (_EventEmitter) {
    (0, _inherits3.default)(AssertionExecutor, _EventEmitter);

    function AssertionExecutor(command, timeout, callsite) {
        (0, _classCallCheck3.default)(this, AssertionExecutor);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.command = command;
        _this.timeout = timeout;
        _this.callsite = callsite;

        _this.startTime = null;
        _this.passed = false;
        _this.inRetry = false;

        var fn = (0, _getFn2.default)(_this.command);
        var actualCommand = _this.command.actual;

        if (actualCommand instanceof _reExecutablePromise2.default) _this.fn = _this._wrapFunction(fn);else if (!_this.command.options.allowUnawaitedPromise && (0, _thennable.isThennable)(actualCommand)) throw new _testRun.AssertionUnawaitedPromiseError(_this.callsite);else _this.fn = fn;
        return _this;
    }

    AssertionExecutor.prototype._getTimeLeft = function _getTimeLeft() {
        return this.timeout - (new Date() - this.startTime);
    };

    AssertionExecutor.prototype._onExecutionFinished = function _onExecutionFinished() {
        if (this.inRetry) this.emit('end-assertion-retries', this.passed);
    };

    AssertionExecutor.prototype._wrapFunction = function _wrapFunction(fn) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var resultPromise;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            resultPromise = _this2.command.actual;

                        case 1:
                            if (_this2.passed) {
                                _context.next = 22;
                                break;
                            }

                            _context.next = 4;
                            return resultPromise._reExecute();

                        case 4:
                            _this2.command.actual = _context.sent;
                            _context.prev = 5;

                            fn();
                            _this2.passed = true;
                            _this2._onExecutionFinished();
                            _context.next = 20;
                            break;

                        case 11:
                            _context.prev = 11;
                            _context.t0 = _context['catch'](5);

                            if (!(_this2._getTimeLeft() <= 0)) {
                                _context.next = 16;
                                break;
                            }

                            _this2._onExecutionFinished();
                            throw _context.t0;

                        case 16:
                            _context.next = 18;
                            return (0, _delay2.default)(ASSERTION_DELAY);

                        case 18:

                            _this2.inRetry = true;
                            _this2.emit('start-assertion-retries', _this2._getTimeLeft());

                        case 20:
                            _context.next = 1;
                            break;

                        case 22:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this2, [[5, 11]]);
        }));
    };

    AssertionExecutor.prototype.run = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            this.startTime = new Date();

                            _context2.prev = 1;
                            _context2.next = 4;
                            return this.fn();

                        case 4:
                            _context2.next = 12;
                            break;

                        case 6:
                            _context2.prev = 6;
                            _context2.t0 = _context2['catch'](1);

                            if (!(_context2.t0.name === 'AssertionError' || _context2.t0.constructor.name === 'AssertionError')) {
                                _context2.next = 10;
                                break;
                            }

                            throw new _testRun.ExternalAssertionLibraryError(_context2.t0, this.callsite);

                        case 10:

                            if (_context2.t0.isTestCafeError) _context2.t0.callsite = this.callsite;

                            throw _context2.t0;

                        case 12:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[1, 6]]);
        }));

        function run() {
            return _ref2.apply(this, arguments);
        }

        return run;
    }();

    return AssertionExecutor;
}(_events.EventEmitter);

exports.default = AssertionExecutor;
module.exports = exports['default'];