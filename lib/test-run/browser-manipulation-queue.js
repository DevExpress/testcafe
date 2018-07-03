'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _utils = require('./commands/utils');

var _type = require('./commands/type');

var _type2 = _interopRequireDefault(_type);

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

var _testRun = require('../errors/test-run/');

var _type3 = require('../errors/test-run/type');

var _type4 = _interopRequireDefault(_type3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BrowserManipulationQueue = function () {
    function BrowserManipulationQueue(browserConnection, screenshotCapturer, warningLog) {
        (0, _classCallCheck3.default)(this, BrowserManipulationQueue);

        this.commands = [];
        this.browserId = browserConnection.id;
        this.browserProvider = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog = warningLog;
    }

    BrowserManipulationQueue.prototype._resizeWindow = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(width, height, currentWidth, currentHeight) {
            var canResizeWindow;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return this.browserProvider.canResizeWindowToDimensions(this.browserId, width, height);

                        case 2:
                            canResizeWindow = _context.sent;

                            if (canResizeWindow) {
                                _context.next = 5;
                                break;
                            }

                            throw new _testRun.WindowDimensionsOverflowError();

                        case 5:
                            _context.prev = 5;
                            _context.next = 8;
                            return this.browserProvider.resizeWindow(this.browserId, width, height, currentWidth, currentHeight);

                        case 8:
                            return _context.abrupt('return', _context.sent);

                        case 11:
                            _context.prev = 11;
                            _context.t0 = _context['catch'](5);

                            this.warningLog.addWarning(_warningMessage2.default.resizeError, _context.t0.message);
                            return _context.abrupt('return', null);

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[5, 11]]);
        }));

        function _resizeWindow(_x, _x2, _x3, _x4) {
            return _ref.apply(this, arguments);
        }

        return _resizeWindow;
    }();

    BrowserManipulationQueue.prototype._resizeWindowToFitDevice = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(device, portrait, currentWidth, currentHeight) {
            var _getViewportSize, landscapeWidth, portraitWidth, width, height;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _getViewportSize = (0, _testcafeBrowserTools.getViewportSize)(device), landscapeWidth = _getViewportSize.landscapeWidth, portraitWidth = _getViewportSize.portraitWidth;
                            width = portrait ? portraitWidth : landscapeWidth;
                            height = portrait ? landscapeWidth : portraitWidth;
                            _context2.next = 5;
                            return this._resizeWindow(width, height, currentWidth, currentHeight);

                        case 5:
                            return _context2.abrupt('return', _context2.sent);

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _resizeWindowToFitDevice(_x5, _x6, _x7, _x8) {
            return _ref2.apply(this, arguments);
        }

        return _resizeWindowToFitDevice;
    }();

    BrowserManipulationQueue.prototype._maximizeWindow = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return this.browserProvider.maximizeWindow(this.browserId);

                        case 3:
                            return _context3.abrupt('return', _context3.sent);

                        case 6:
                            _context3.prev = 6;
                            _context3.t0 = _context3['catch'](0);

                            this.warningLog.addWarning(_warningMessage2.default.maximizeError, _context3.t0.message);
                            return _context3.abrupt('return', null);

                        case 10:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 6]]);
        }));

        function _maximizeWindow() {
            return _ref3.apply(this, arguments);
        }

        return _maximizeWindow;
    }();

    BrowserManipulationQueue.prototype._takeScreenshot = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(capture) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (this.screenshotCapturer.enabled) {
                                _context4.next = 3;
                                break;
                            }

                            this.warningLog.addWarning(_warningMessage2.default.screenshotsPathNotSpecified);
                            return _context4.abrupt('return', null);

                        case 3:
                            _context4.prev = 3;
                            _context4.next = 6;
                            return capture();

                        case 6:
                            return _context4.abrupt('return', _context4.sent);

                        case 9:
                            _context4.prev = 9;
                            _context4.t0 = _context4['catch'](3);

                            if (!(_context4.t0.type === _type4.default.invalidElementScreenshotDimensionsError)) {
                                _context4.next = 13;
                                break;
                            }

                            throw _context4.t0;

                        case 13:

                            this.warningLog.addWarning(_warningMessage2.default.screenshotError, _context4.t0.stack);
                            return _context4.abrupt('return', null);

                        case 15:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[3, 9]]);
        }));

        function _takeScreenshot(_x9) {
            return _ref4.apply(this, arguments);
        }

        return _takeScreenshot;
    }();

    BrowserManipulationQueue.prototype.executePendingManipulation = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(driverMsg) {
            var _this = this;

            var command;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            command = this.commands.shift();
                            _context5.t0 = command.type;
                            _context5.next = _context5.t0 === _type2.default.takeElementScreenshot ? 4 : _context5.t0 === _type2.default.takeScreenshot ? 4 : _context5.t0 === _type2.default.takeScreenshotOnFail ? 7 : _context5.t0 === _type2.default.resizeWindow ? 10 : _context5.t0 === _type2.default.resizeWindowToFitDevice ? 13 : _context5.t0 === _type2.default.maximizeWindow ? 16 : 19;
                            break;

                        case 4:
                            _context5.next = 6;
                            return this._takeScreenshot(function () {
                                return _this.screenshotCapturer.captureAction({
                                    customPath: command.path,
                                    pageDimensions: driverMsg.pageDimensions,
                                    cropDimensions: driverMsg.cropDimensions,
                                    markSeed: command.markSeed
                                });
                            });

                        case 6:
                            return _context5.abrupt('return', _context5.sent);

                        case 7:
                            _context5.next = 9;
                            return this._takeScreenshot(function () {
                                return _this.screenshotCapturer.captureError({
                                    pageDimensions: driverMsg.pageDimensions,
                                    markSeed: command.markSeed
                                });
                            });

                        case 9:
                            return _context5.abrupt('return', _context5.sent);

                        case 10:
                            _context5.next = 12;
                            return this._resizeWindow(command.width, command.height, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);

                        case 12:
                            return _context5.abrupt('return', _context5.sent);

                        case 13:
                            _context5.next = 15;
                            return this._resizeWindowToFitDevice(command.device, command.options.portraitOrientation, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);

                        case 15:
                            return _context5.abrupt('return', _context5.sent);

                        case 16:
                            _context5.next = 18;
                            return this._maximizeWindow();

                        case 18:
                            return _context5.abrupt('return', _context5.sent);

                        case 19:
                            return _context5.abrupt('return', null);

                        case 20:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function executePendingManipulation(_x10) {
            return _ref5.apply(this, arguments);
        }

        return executePendingManipulation;
    }();

    BrowserManipulationQueue.prototype.push = function push(command) {
        this.commands.push(command);
    };

    BrowserManipulationQueue.prototype.removeAllNonServiceManipulations = function removeAllNonServiceManipulations() {
        this.commands = this.commands.filter(function (command) {
            return (0, _utils.isServiceCommand)(command);
        });
    };

    return BrowserManipulationQueue;
}();

exports.default = BrowserManipulationQueue;
module.exports = exports['default'];