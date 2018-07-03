'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _runtimeInfo = require('./runtime-info');

var _runtimeInfo2 = _interopRequireDefault(_runtimeInfo);

var _localFirefox = require('./local-firefox');

var _marionetteClient = require('./marionette-client');

var _marionetteClient2 = _interopRequireDefault(_marionetteClient);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _getMaximizedHeadlessWindowSize = require('../../utils/get-maximized-headless-window-size');

var _getMaximizedHeadlessWindowSize2 = _interopRequireDefault(_getMaximizedHeadlessWindowSize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    openedBrowsers: {},

    isMultiBrowser: false,

    _createMarionetteClient: function _createMarionetteClient(runtimeInfo) {
        var _this = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var marionetteClient;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            marionetteClient = new _marionetteClient2.default(runtimeInfo.marionettePort);
                            _context.next = 4;
                            return marionetteClient.connect();

                        case 4:
                            return _context.abrupt('return', marionetteClient);

                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', null);

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 7]]);
        }))();
    },
    openBrowser: function openBrowser(browserId, pageUrl, configString) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var runtimeInfo, browserName;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return (0, _runtimeInfo2.default)(configString);

                        case 2:
                            runtimeInfo = _context2.sent;
                            browserName = _this2.providerName.replace(':', '');


                            runtimeInfo.browserId = browserId;
                            runtimeInfo.browserName = browserName;

                            _context2.next = 8;
                            return (0, _localFirefox.start)(pageUrl, runtimeInfo);

                        case 8:
                            _context2.next = 10;
                            return _this2.waitForConnectionReady(runtimeInfo.browserId);

                        case 10:
                            _context2.next = 12;
                            return _this2._createMarionetteClient(runtimeInfo);

                        case 12:
                            runtimeInfo.marionetteClient = _context2.sent;


                            _this2.openedBrowsers[browserId] = runtimeInfo;

                        case 14:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    },
    closeBrowser: function closeBrowser(browserId) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var runtimeInfo, config, marionetteClient;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            runtimeInfo = _this3.openedBrowsers[browserId];
                            config = runtimeInfo.config, marionetteClient = runtimeInfo.marionetteClient;

                            if (!config.headless) {
                                _context3.next = 7;
                                break;
                            }

                            _context3.next = 5;
                            return marionetteClient.quit();

                        case 5:
                            _context3.next = 9;
                            break;

                        case 7:
                            _context3.next = 9;
                            return _this3.closeLocalBrowser(browserId);

                        case 9:
                            if (!(_osFamily2.default.mac && !config.headless)) {
                                _context3.next = 12;
                                break;
                            }

                            _context3.next = 12;
                            return (0, _localFirefox.stop)(runtimeInfo);

                        case 12:

                            delete _this3.openedBrowsers[browserId];

                        case 13:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3);
        }))();
    },
    isLocalBrowser: function isLocalBrowser(browserId, configString) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var config;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            config = _this4.openedBrowsers[browserId] ? _this4.openedBrowsers[browserId].config : (0, _config2.default)(configString);
                            return _context4.abrupt('return', !config.headless);

                        case 2:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4);
        }))();
    },
    takeScreenshot: function takeScreenshot(browserId, path) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var marionetteClient;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            marionetteClient = _this5.openedBrowsers[browserId].marionetteClient;
                            _context5.next = 3;
                            return marionetteClient.takeScreenshot(path);

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this5);
        }))();
    },
    resizeWindow: function resizeWindow(browserId, width, height) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var marionetteClient;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            marionetteClient = _this6.openedBrowsers[browserId].marionetteClient;
                            _context6.next = 3;
                            return marionetteClient.setWindowSize(width, height);

                        case 3:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this6);
        }))();
    },
    maximizeWindow: function maximizeWindow(browserId) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            var maximumSize;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            maximumSize = (0, _getMaximizedHeadlessWindowSize2.default)();
                            _context7.next = 3;
                            return _this7.resizeWindow(browserId, maximumSize.width, maximumSize.height);

                        case 3:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this7);
        }))();
    },
    hasCustomActionForBrowser: function hasCustomActionForBrowser(browserId) {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
            var _openedBrowsers$brows, config, marionetteClient;

            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _openedBrowsers$brows = _this8.openedBrowsers[browserId], config = _openedBrowsers$brows.config, marionetteClient = _openedBrowsers$brows.marionetteClient;
                            return _context8.abrupt('return', {
                                hasCloseBrowser: true,
                                hasTakeScreenshot: !!marionetteClient,
                                hasChromelessScreenshots: !!marionetteClient,
                                hasResizeWindow: !!marionetteClient && config.headless,
                                hasMaximizeWindow: !!marionetteClient && config.headless,
                                hasCanResizeWindowToDimensions: false
                            });

                        case 2:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, _this8);
        }))();
    }
};
module.exports = exports['default'];