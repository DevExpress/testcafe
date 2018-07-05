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

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _browserJobResult = require('../../runner/browser-job-result');

var _browserJobResult2 = _interopRequireDefault(_browserJobResult);

var _connection = require('../connection');

var _connection2 = _interopRequireDefault(_connection);

var _warningMessage = require('../../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global Symbol */
var name = (0, _symbol2.default)();

var BrowserProviderPluginHost = function () {
    function BrowserProviderPluginHost(providerObject, providerName) {
        (0, _classCallCheck3.default)(this, BrowserProviderPluginHost);

        this.JOB_RESULT = (0, _lodash.assignIn)({}, _browserJobResult2.default);

        (0, _lodash.assignIn)(this, providerObject);

        this[name] = providerName;
    }

    // Helpers


    BrowserProviderPluginHost.prototype.runInitScript = function runInitScript(browserId, code) {
        var connection = _connection2.default.getById(browserId);

        return connection.runInitScript('(' + code + ')()');
    };

    BrowserProviderPluginHost.prototype.waitForConnectionReady = function waitForConnectionReady(browserId) {
        var connection = _connection2.default.getById(browserId);

        if (connection.ready) return _pinkie2.default.resolve();

        return (0, _promisifyEvent2.default)(connection, 'ready');
    };

    BrowserProviderPluginHost.prototype.reportWarning = function reportWarning(browserId) {
        var connection = _connection2.default.getById(browserId);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        connection.addWarning.apply(connection, args);
    };

    BrowserProviderPluginHost.prototype.setUserAgentMetaInfo = function setUserAgentMetaInfo(browserId, message) {
        var connection = _connection2.default.getById(browserId);

        connection.setProviderMetaInfo(message);
    };

    BrowserProviderPluginHost.prototype.closeLocalBrowser = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(browserId) {
            var connection;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            connection = _connection2.default.getById(browserId);
                            _context.next = 3;
                            return connection.provider._ensureBrowserWindowDescriptor(browserId);

                        case 3:
                            _context.next = 5;
                            return connection.provider._closeLocalBrowser(browserId);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function closeLocalBrowser(_x) {
            return _ref.apply(this, arguments);
        }

        return closeLocalBrowser;
    }();

    BrowserProviderPluginHost.prototype.resizeLocalBrowserWindow = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(browserId, width, height, currentWidth, currentHeight) {
            var connection;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            connection = _connection2.default.getById(browserId);
                            _context2.next = 3;
                            return connection.provider._ensureBrowserWindowParameters(browserId);

                        case 3:
                            _context2.next = 5;
                            return connection.provider._resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight);

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function resizeLocalBrowserWindow(_x2, _x3, _x4, _x5, _x6) {
            return _ref2.apply(this, arguments);
        }

        return resizeLocalBrowserWindow;
    }();

    // API
    // Browser control


    BrowserProviderPluginHost.prototype.openBrowser = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            throw new Error('Not implemented!');

                        case 1:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function openBrowser() {
            return _ref3.apply(this, arguments);
        }

        return openBrowser;
    }();

    BrowserProviderPluginHost.prototype.closeBrowser = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            throw new Error('Not implemented!');

                        case 1:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function closeBrowser() {
            return _ref4.apply(this, arguments);
        }

        return closeBrowser;
    }();

    // Initialization


    BrowserProviderPluginHost.prototype.init = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            return _context5.abrupt('return');

                        case 1:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function init() {
            return _ref5.apply(this, arguments);
        }

        return init;
    }();

    BrowserProviderPluginHost.prototype.dispose = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            return _context6.abrupt('return');

                        case 1:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function dispose() {
            return _ref6.apply(this, arguments);
        }

        return dispose;
    }();

    // Browser names handling


    BrowserProviderPluginHost.prototype.getBrowserList = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            throw new Error('Not implemented!');

                        case 1:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function getBrowserList() {
            return _ref7.apply(this, arguments);
        }

        return getBrowserList;
    }();

    BrowserProviderPluginHost.prototype.isValidBrowserName = function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            return _context8.abrupt('return', true);

                        case 1:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function isValidBrowserName() {
            return _ref8.apply(this, arguments);
        }

        return isValidBrowserName;
    }();

    // Extra functions


    BrowserProviderPluginHost.prototype.isLocalBrowser = function () {
        var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            return _context9.abrupt('return', false);

                        case 1:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function isLocalBrowser() {
            return _ref9.apply(this, arguments);
        }

        return isLocalBrowser;
    }();

    BrowserProviderPluginHost.prototype.hasCustomActionForBrowser = function () {
        var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            return _context10.abrupt('return', {
                                hasCloseBrowser: this.hasOwnProperty('closeBrowser'),
                                hasResizeWindow: this.hasOwnProperty('resizeWindow'),
                                hasTakeScreenshot: this.hasOwnProperty('takeScreenshot'),
                                hasCanResizeWindowToDimensions: this.hasOwnProperty('canResizeWindowToDimensions'),
                                hasMaximizeWindow: this.hasOwnProperty('maximizeWindow'),
                                hasChromelessScreenshots: false
                            });

                        case 1:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function hasCustomActionForBrowser() {
            return _ref10.apply(this, arguments);
        }

        return hasCustomActionForBrowser;
    }();

    BrowserProviderPluginHost.prototype.resizeWindow = function () {
        var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(browserId /*, width, height, currentWidth, currentHeight */) {
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            this.reportWarning(browserId, _warningMessage2.default.resizeNotSupportedByBrowserProvider, this[name]);

                        case 1:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function resizeWindow(_x7) {
            return _ref11.apply(this, arguments);
        }

        return resizeWindow;
    }();

    BrowserProviderPluginHost.prototype.canResizeWindowToDimensions = function () {
        var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            return _context12.abrupt('return', true);

                        case 1:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        }));

        function canResizeWindowToDimensions() {
            return _ref12.apply(this, arguments);
        }

        return canResizeWindowToDimensions;
    }();

    BrowserProviderPluginHost.prototype.takeScreenshot = function () {
        var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(browserId /*, screenshotPath, pageWidth, pageHeight */) {
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            this.reportWarning(browserId, _warningMessage2.default.screenshotNotSupportedByBrowserProvider, this[name]);

                        case 1:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this);
        }));

        function takeScreenshot(_x8) {
            return _ref13.apply(this, arguments);
        }

        return takeScreenshot;
    }();

    BrowserProviderPluginHost.prototype.maximizeWindow = function () {
        var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(browserId) {
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            this.reportWarning(browserId, _warningMessage2.default.maximizeNotSupportedByBrowserProvider, this[name]);

                        case 1:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this);
        }));

        function maximizeWindow(_x9) {
            return _ref14.apply(this, arguments);
        }

        return maximizeWindow;
    }();

    BrowserProviderPluginHost.prototype.reportJobResult = function () {
        var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            return _context15.abrupt('return');

                        case 1:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this);
        }));

        function reportJobResult() {
            return _ref15.apply(this, arguments);
        }

        return reportJobResult;
    }();

    (0, _createClass3.default)(BrowserProviderPluginHost, [{
        key: 'providerName',
        get: function get() {
            return this[name];
        }
    }]);
    return BrowserProviderPluginHost;
}();

exports.default = BrowserProviderPluginHost;
module.exports = exports['default'];