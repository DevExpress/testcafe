'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _string = require('../../../utils/string');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    isMultiBrowser: true,

    _handleString: function _handleString(str) {
        var _this = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var args, path, browserInfo, params;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            args = (0, _string.splitQuotedText)(str, ' ', '`"\'');
                            path = args.shift();
                            _context.next = 4;
                            return _testcafeBrowserTools2.default.getBrowserInfo(path);

                        case 4:
                            browserInfo = _context.sent;

                            if (browserInfo) {
                                _context.next = 7;
                                break;
                            }

                            return _context.abrupt('return', null);

                        case 7:
                            params = (0, _assign2.default)({}, browserInfo);


                            if (args.length) params.cmd = args.join(' ') + (params.cmd ? ' ' + params.cmd : '');

                            return _context.abrupt('return', params);

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    },
    _handleJSON: function _handleJSON(str) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var params, openParameters;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            params = null;
                            _context2.prev = 1;

                            params = JSON.parse(str);
                            _context2.next = 8;
                            break;

                        case 5:
                            _context2.prev = 5;
                            _context2.t0 = _context2['catch'](1);
                            return _context2.abrupt('return', null);

                        case 8:
                            if (params.path) {
                                _context2.next = 10;
                                break;
                            }

                            return _context2.abrupt('return', null);

                        case 10:
                            _context2.next = 12;
                            return _testcafeBrowserTools2.default.getBrowserInfo(params.path);

                        case 12:
                            openParameters = _context2.sent;

                            if (openParameters) {
                                _context2.next = 15;
                                break;
                            }

                            return _context2.abrupt('return', null);

                        case 15:

                            if (params.cmd) openParameters.cmd = params.cmd;

                            return _context2.abrupt('return', openParameters);

                        case 17:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2, [[1, 5]]);
        }))();
    },
    openBrowser: function openBrowser(browserId, pageUrl, browserName) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var openParameters;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return _this3._handleString(browserName);

                        case 2:
                            _context3.t0 = _context3.sent;

                            if (_context3.t0) {
                                _context3.next = 7;
                                break;
                            }

                            _context3.next = 6;
                            return _this3._handleJSON(browserName);

                        case 6:
                            _context3.t0 = _context3.sent;

                        case 7:
                            openParameters = _context3.t0;

                            if (openParameters) {
                                _context3.next = 10;
                                break;
                            }

                            throw new Error('The specified browser name is not valid!');

                        case 10:
                            _context3.next = 12;
                            return _testcafeBrowserTools2.default.open(openParameters, pageUrl);

                        case 12:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3);
        }))();
    },
    isLocalBrowser: function isLocalBrowser() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', true);

                        case 1:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4);
        }))();
    }
};
module.exports = exports['default'];