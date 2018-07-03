'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _url = require('url');

var _runtimeInfo = require('./runtime-info');

var _runtimeInfo2 = _interopRequireDefault(_runtimeInfo);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _localChrome = require('./local-chrome');

var _cdp = require('./cdp');

var cdp = _interopRequireWildcard(_cdp);

var _getMaximizedHeadlessWindowSize = require('../../utils/get-maximized-headless-window-size');

var _getMaximizedHeadlessWindowSize2 = _interopRequireDefault(_getMaximizedHeadlessWindowSize);

var _clientFunctions = require('../../utils/client-functions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    openedBrowsers: {},

    isMultiBrowser: false,

    openBrowser: function openBrowser(browserId, pageUrl, configString) {
        var _this = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var runtimeInfo, browserName;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _runtimeInfo2.default)((0, _url.parse)(pageUrl).hostname, configString);

                        case 2:
                            runtimeInfo = _context.sent;
                            browserName = _this.providerName.replace(':', '');


                            runtimeInfo.browserId = browserId;
                            runtimeInfo.browserName = browserName;

                            runtimeInfo.providerMethods = {
                                resizeLocalBrowserWindow: function resizeLocalBrowserWindow() {
                                    return _this.resizeLocalBrowserWindow.apply(_this, arguments);
                                }
                            };

                            _context.next = 9;
                            return (0, _localChrome.start)(pageUrl, runtimeInfo);

                        case 9:
                            _context.next = 11;
                            return _this.waitForConnectionReady(browserId);

                        case 11:
                            _context.next = 13;
                            return _this.runInitScript(browserId, _clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

                        case 13:
                            runtimeInfo.viewportSize = _context.sent;
                            _context.next = 16;
                            return cdp.createClient(runtimeInfo);

                        case 16:

                            _this.openedBrowsers[browserId] = runtimeInfo;

                        case 17:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    },
    closeBrowser: function closeBrowser(browserId) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var runtimeInfo;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            runtimeInfo = _this2.openedBrowsers[browserId];

                            if (!cdp.isHeadlessTab(runtimeInfo)) {
                                _context2.next = 6;
                                break;
                            }

                            _context2.next = 4;
                            return cdp.closeTab(runtimeInfo);

                        case 4:
                            _context2.next = 8;
                            break;

                        case 6:
                            _context2.next = 8;
                            return _this2.closeLocalBrowser(browserId);

                        case 8:
                            if (!(_osFamily2.default.mac || runtimeInfo.config.headless)) {
                                _context2.next = 11;
                                break;
                            }

                            _context2.next = 11;
                            return (0, _localChrome.stop)(runtimeInfo);

                        case 11:

                            delete _this2.openedBrowsers[browserId];

                        case 12:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    },
    isLocalBrowser: function isLocalBrowser(browserId, configString) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var config;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            config = _this3.openedBrowsers[browserId] ? _this3.openedBrowsers[browserId].config : (0, _config2.default)(configString);
                            return _context3.abrupt('return', !config.headless);

                        case 2:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3);
        }))();
    },
    takeScreenshot: function takeScreenshot(browserId, path) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var runtimeInfo;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            runtimeInfo = _this4.openedBrowsers[browserId];
                            _context4.next = 3;
                            return cdp.takeScreenshot(path, runtimeInfo);

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4);
        }))();
    },
    resizeWindow: function resizeWindow(browserId, width, height, currentWidth, currentHeight) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var runtimeInfo;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            runtimeInfo = _this5.openedBrowsers[browserId];

                            if (!runtimeInfo.config.mobile) {
                                _context5.next = 6;
                                break;
                            }

                            _context5.next = 4;
                            return cdp.updateMobileViewportSize(runtimeInfo);

                        case 4:
                            _context5.next = 8;
                            break;

                        case 6:
                            runtimeInfo.viewportSize.width = currentWidth;
                            runtimeInfo.viewportSize.height = currentHeight;

                        case 8:
                            _context5.next = 10;
                            return cdp.resizeWindow({ width: width, height: height }, runtimeInfo);

                        case 10:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this5);
        }))();
    },
    maximizeWindow: function maximizeWindow(browserId) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var maximumSize;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            maximumSize = (0, _getMaximizedHeadlessWindowSize2.default)();
                            _context6.next = 3;
                            return _this6.resizeWindow(browserId, maximumSize.width, maximumSize.height, maximumSize.width, maximumSize.height);

                        case 3:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, _this6);
        }))();
    },
    hasCustomActionForBrowser: function hasCustomActionForBrowser(browserId) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            var _openedBrowsers$brows, config, client;

            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _openedBrowsers$brows = _this7.openedBrowsers[browserId], config = _openedBrowsers$brows.config, client = _openedBrowsers$brows.client;
                            return _context7.abrupt('return', {
                                hasCloseBrowser: true,
                                hasResizeWindow: !!client && (config.emulation || config.headless),
                                hasMaximizeWindow: !!client && config.headless,
                                hasTakeScreenshot: !!client,
                                hasChromelessScreenshots: !!client,
                                hasCanResizeWindowToDimensions: false
                            });

                        case 2:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this7);
        }))();
    }
};
module.exports = exports['default'];