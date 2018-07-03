'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _warningMessage = require('../../../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    localBrowsersFlags: {},

    openBrowser: function openBrowser(browserId) {
        var _this = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var localBrowserWindow;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _this.waitForConnectionReady(browserId);

                        case 2:
                            _context.next = 4;
                            return (0, _testcafeBrowserTools.findWindow)(browserId);

                        case 4:
                            localBrowserWindow = _context.sent;


                            _this.localBrowsersFlags[browserId] = localBrowserWindow !== null;

                        case 6:
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
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            delete _this2.localBrowsersFlags[browserId];

                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    },
    isLocalBrowser: function isLocalBrowser(browserId) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', _this3.localBrowsersFlags[browserId]);

                        case 1:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3);
        }))();
    },


    // NOTE: we must try to do a local screenshot or resize, if browser is accessible, and emit warning otherwise
    hasCustomActionForBrowser: function hasCustomActionForBrowser(browserId) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var isLocalBrowser;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            isLocalBrowser = _this4.localBrowsersFlags[browserId];
                            return _context4.abrupt('return', {
                                hasCloseBrowser: true,
                                hasResizeWindow: !isLocalBrowser,
                                hasMaximizeWindow: !isLocalBrowser,
                                hasTakeScreenshot: !isLocalBrowser,
                                hasCanResizeWindowToDimensions: !isLocalBrowser
                            });

                        case 2:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4);
        }))();
    },
    takeScreenshot: function takeScreenshot(browserId) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _this5.reportWarning(browserId, _warningMessage2.default.browserManipulationsOnRemoteBrowser);

                        case 1:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this5);
        }))();
    },
    resizeWindow: function resizeWindow(browserId) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _this6.reportWarning(browserId, _warningMessage2.default.browserManipulationsOnRemoteBrowser);

                        case 1:
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
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _this7.reportWarning(browserId, _warningMessage2.default.browserManipulationsOnRemoteBrowser);

                        case 1:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, _this7);
        }))();
    }
};
module.exports = exports['default'];