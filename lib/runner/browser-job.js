'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _events = require('events');

var _lodash = require('lodash');

var _testRunController = require('./test-run-controller');

var _testRunController2 = _interopRequireDefault(_testRunController);

var _sessionController = require('../test-run/session-controller');

var _sessionController2 = _interopRequireDefault(_sessionController);

var _browserJobResult = require('./browser-job-result');

var _browserJobResult2 = _interopRequireDefault(_browserJobResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Browser job
var BrowserJob = function (_EventEmitter) {
    (0, _inherits3.default)(BrowserJob, _EventEmitter);

    function BrowserJob(tests, browserConnections, proxy, screenshots, warningLog, fixtureHookController, opts) {
        (0, _classCallCheck3.default)(this, BrowserJob);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.started = false;

        _this.total = 0;
        _this.passed = 0;
        _this.opts = opts;
        _this.proxy = proxy;
        _this.browserConnections = browserConnections;
        _this.screenshots = screenshots;
        _this.warningLog = warningLog;
        _this.fixtureHookController = fixtureHookController;
        _this.result = null;

        _this.testRunControllerQueue = tests.map(function (test, index) {
            return _this._createTestRunController(test, index);
        });

        _this.completionQueue = [];

        _this.connectionErrorListener = function (error) {
            return _this._setResult(_browserJobResult2.default.errored, error);
        };

        _this.browserConnections.map(function (bc) {
            return bc.once('error', _this.connectionErrorListener);
        });
        return _this;
    }

    BrowserJob.prototype._createTestRunController = function _createTestRunController(test, index) {
        var _this2 = this;

        var testRunController = new _testRunController2.default(test, index + 1, this.proxy, this.screenshots, this.warningLog, this.fixtureHookController, this.opts);

        testRunController.on('test-run-start', function () {
            return _this2.emit('test-run-start', testRunController.testRun);
        });
        testRunController.on('test-run-restart', function () {
            return _this2._onTestRunRestart(testRunController);
        });
        testRunController.on('test-run-done', function () {
            return _this2._onTestRunDone(testRunController);
        });

        return testRunController;
    };

    BrowserJob.prototype._setResult = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(status, data) {
            var _this3 = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!this.result) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return');

                        case 2:

                            this.result = { status: status, data: data };

                            this.browserConnections.forEach(function (bc) {
                                return bc.removeListener('error', _this3.connectionErrorListener);
                            });

                            _context.next = 6;
                            return _pinkie2.default.all(this.browserConnections.map(function (bc) {
                                return bc.reportJobResult(_this3.result.status, _this3.result.data);
                            }));

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _setResult(_x, _x2) {
            return _ref.apply(this, arguments);
        }

        return _setResult;
    }();

    BrowserJob.prototype._addToCompletionQueue = function _addToCompletionQueue(testRunInfo) {
        this.completionQueue.push(testRunInfo);
    };

    BrowserJob.prototype._removeFromCompletionQueue = function _removeFromCompletionQueue(testRunInfo) {
        (0, _lodash.remove)(this.completionQueue, testRunInfo);
    };

    BrowserJob.prototype._onTestRunRestart = function _onTestRunRestart(testRunController) {
        this._removeFromCompletionQueue(testRunController);
        this.testRunControllerQueue.unshift(testRunController);
    };

    BrowserJob.prototype._onTestRunDone = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(testRunController) {
            var _this4 = this;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            this.total++;

                            if (!testRunController.testRun.errs.length) this.passed++;

                            while (this.completionQueue.length && this.completionQueue[0].done) {
                                testRunController = this.completionQueue.shift();

                                this.emit('test-run-done', testRunController.testRun);
                            }

                            if (!this.completionQueue.length && !this.hasQueuedTestRuns) {
                                _sessionController2.default.closeSession(testRunController.testRun);

                                this._setResult(_browserJobResult2.default.done, { total: this.total, passed: this.passed }).then(function () {
                                    return _this4.emit('done');
                                });
                            }

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _onTestRunDone(_x3) {
            return _ref2.apply(this, arguments);
        }

        return _onTestRunDone;
    }();

    // API


    BrowserJob.prototype.popNextTestRunUrl = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(connection) {
            var testRunController, testRunUrl;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!this.testRunControllerQueue.length) {
                                _context3.next = 13;
                                break;
                            }

                            if (!this.testRunControllerQueue[0].blocked) {
                                _context3.next = 3;
                                break;
                            }

                            return _context3.abrupt('break', 13);

                        case 3:
                            testRunController = this.testRunControllerQueue.shift();


                            this._addToCompletionQueue(testRunController);

                            if (!this.started) {
                                this.started = true;
                                this.emit('start');
                            }

                            _context3.next = 8;
                            return testRunController.start(connection);

                        case 8:
                            testRunUrl = _context3.sent;

                            if (!testRunUrl) {
                                _context3.next = 11;
                                break;
                            }

                            return _context3.abrupt('return', testRunUrl);

                        case 11:
                            _context3.next = 0;
                            break;

                        case 13:
                            return _context3.abrupt('return', null);

                        case 14:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function popNextTestRunUrl(_x4) {
            return _ref3.apply(this, arguments);
        }

        return popNextTestRunUrl;
    }();

    BrowserJob.prototype.abort = function abort() {
        var _this5 = this;

        this.removeAllListeners();
        this._setResult(_browserJobResult2.default.aborted);
        this.browserConnections.map(function (bc) {
            return bc.removeJob(_this5);
        });
    };

    (0, _createClass3.default)(BrowserJob, [{
        key: 'hasQueuedTestRuns',
        get: function get() {
            return !!this.testRunControllerQueue.length;
        }
    }]);
    return BrowserJob;
}(_events.EventEmitter);

exports.default = BrowserJob;
module.exports = exports['default'];