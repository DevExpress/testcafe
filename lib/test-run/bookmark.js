'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _phase = require('../test-run/phase');

var _phase2 = _interopRequireDefault(_phase);

var _type = require('../errors/test-run/type');

var _type2 = _interopRequireDefault(_type);

var _actions = require('./commands/actions');

var _testRun = require('../errors/test-run');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TestRunBookmark = function () {
    function TestRunBookmark(testRun, role) {
        (0, _classCallCheck3.default)(this, TestRunBookmark);

        this.testRun = testRun;
        this.role = role;

        this.url = 'about:blank';
        this.dialogHandler = testRun.activeDialogHandler;
        this.iframeSelector = testRun.activeIframeSelector;
        this.speed = testRun.speed;
        this.pageLoadTimeout = testRun.pageLoadTimeout;
        this.ctx = testRun.ctx;
        this.fixtureCtx = testRun.fixtureCtx;
        this.consoleMessages = testRun.consoleMessages;
    }

    TestRunBookmark.prototype.init = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!this.testRun.activeIframeSelector) {
                                _context.next = 3;
                                break;
                            }

                            _context.next = 3;
                            return this.testRun.executeCommand(new _actions.SwitchToMainWindowCommand());

                        case 3:
                            if (this.role.opts.preserveUrl) {
                                _context.next = 7;
                                break;
                            }

                            _context.next = 6;
                            return this.testRun.getCurrentUrl();

                        case 6:
                            this.url = _context.sent;

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function init() {
            return _ref.apply(this, arguments);
        }

        return init;
    }();

    TestRunBookmark.prototype._restoreDialogHandler = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var restoreDialogCommand;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(this.testRun.activeDialogHandler !== this.dialogHandler)) {
                                _context2.next = 4;
                                break;
                            }

                            restoreDialogCommand = new _actions.SetNativeDialogHandlerCommand({ dialogHandler: { fn: this.dialogHandler } });
                            _context2.next = 4;
                            return this.testRun.executeCommand(restoreDialogCommand);

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _restoreDialogHandler() {
            return _ref2.apply(this, arguments);
        }

        return _restoreDialogHandler;
    }();

    TestRunBookmark.prototype._restoreSpeed = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var restoreSpeedCommand;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(this.testRun.speed !== this.speed)) {
                                _context3.next = 4;
                                break;
                            }

                            restoreSpeedCommand = new _actions.SetTestSpeedCommand({ speed: this.speed });
                            _context3.next = 4;
                            return this.testRun.executeCommand(restoreSpeedCommand);

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _restoreSpeed() {
            return _ref3.apply(this, arguments);
        }

        return _restoreSpeed;
    }();

    TestRunBookmark.prototype._restorePageLoadTimeout = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var restorePageLoadTimeoutCommand;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!(this.testRun.pageLoadTimeout !== this.pageLoadTimeout)) {
                                _context4.next = 4;
                                break;
                            }

                            restorePageLoadTimeoutCommand = new _actions.SetPageLoadTimeoutCommand({ duration: this.pageLoadTimeout });
                            _context4.next = 4;
                            return this.testRun.executeCommand(restorePageLoadTimeoutCommand);

                        case 4:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function _restorePageLoadTimeout() {
            return _ref4.apply(this, arguments);
        }

        return _restorePageLoadTimeout;
    }();

    TestRunBookmark.prototype._restoreWorkingFrame = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var switchWorkingFrameCommand;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            if (!(this.testRun.activeIframeSelector !== this.iframeSelector)) {
                                _context5.next = 14;
                                break;
                            }

                            switchWorkingFrameCommand = this.iframeSelector ? new _actions.SwitchToIframeCommand({ selector: this.iframeSelector }) : new _actions.SwitchToMainWindowCommand();
                            _context5.prev = 2;
                            _context5.next = 5;
                            return this.testRun.executeCommand(switchWorkingFrameCommand);

                        case 5:
                            _context5.next = 14;
                            break;

                        case 7:
                            _context5.prev = 7;
                            _context5.t0 = _context5['catch'](2);

                            if (!(_context5.t0.type === _type2.default.actionElementNotFoundError)) {
                                _context5.next = 11;
                                break;
                            }

                            throw new _testRun.CurrentIframeNotFoundError();

                        case 11:
                            if (!(_context5.t0.type === _type2.default.actionIframeIsNotLoadedError)) {
                                _context5.next = 13;
                                break;
                            }

                            throw new _testRun.CurrentIframeIsNotLoadedError();

                        case 13:
                            throw _context5.t0;

                        case 14:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[2, 7]]);
        }));

        function _restoreWorkingFrame() {
            return _ref5.apply(this, arguments);
        }

        return _restoreWorkingFrame;
    }();

    TestRunBookmark.prototype._restorePage = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(url, stateSnapshot) {
            var navigateCommand;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            navigateCommand = new _actions.NavigateToCommand({ url: url, stateSnapshot: stateSnapshot });
                            _context6.next = 3;
                            return this.testRun.executeCommand(navigateCommand);

                        case 3:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function _restorePage(_x, _x2) {
            return _ref6.apply(this, arguments);
        }

        return _restorePage;
    }();

    TestRunBookmark.prototype.restore = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(callsite, stateSnapshot) {
            var prevPhase, preserveUrl, url;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            prevPhase = this.testRun.phase;


                            this.testRun.phase = _phase2.default.inBookmarkRestore;

                            this.testRun.ctx = this.ctx;
                            this.testRun.fixtureCtx = this.fixtureCtx;
                            this.testRun.consoleMessages = this.consoleMessages;

                            _context7.prev = 5;
                            _context7.next = 8;
                            return this._restoreSpeed();

                        case 8:
                            _context7.next = 10;
                            return this._restorePageLoadTimeout();

                        case 10:
                            _context7.next = 12;
                            return this._restoreDialogHandler();

                        case 12:
                            preserveUrl = this.role.opts.preserveUrl;
                            url = preserveUrl ? this.role.url : this.url;
                            _context7.next = 16;
                            return this._restorePage(url, (0, _stringify2.default)(stateSnapshot));

                        case 16:
                            if (preserveUrl) {
                                _context7.next = 19;
                                break;
                            }

                            _context7.next = 19;
                            return this._restoreWorkingFrame();

                        case 19:
                            _context7.next = 25;
                            break;

                        case 21:
                            _context7.prev = 21;
                            _context7.t0 = _context7['catch'](5);

                            _context7.t0.callsite = callsite;

                            throw _context7.t0;

                        case 25:

                            this.testRun.phase = prevPhase;

                        case 26:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[5, 21]]);
        }));

        function restore(_x3, _x4) {
            return _ref7.apply(this, arguments);
        }

        return restore;
    }();

    return TestRunBookmark;
}();

exports.default = TestRunBookmark;
module.exports = exports['default'];