'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    isMultiBrowser: true,

    openBrowser: function openBrowser(browserId, pageUrl, browserName) {
        var _this = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var args, alias, browserInfo, openParameters;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            args = browserName.split(' ');
                            alias = args.shift();
                            _context.next = 4;
                            return _testcafeBrowserTools2.default.getBrowserInfo(alias);

                        case 4:
                            browserInfo = _context.sent;
                            openParameters = (0, _assign2.default)({}, browserInfo);


                            if (args.length) openParameters.cmd = args.join(' ') + (openParameters.cmd ? ' ' + openParameters.cmd : '');

                            _context.next = 9;
                            return _testcafeBrowserTools2.default.open(openParameters, pageUrl);

                        case 9:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    },
    isLocalBrowser: function isLocalBrowser() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', true);

                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    },
    getBrowserList: function getBrowserList() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var installations;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return _testcafeBrowserTools2.default.getInstallations();

                        case 2:
                            installations = _context3.sent;
                            return _context3.abrupt('return', (0, _keys2.default)(installations));

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3);
        }))();
    },
    isValidBrowserName: function isValidBrowserName(browserName) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var browserNames;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return _this4.getBrowserList();

                        case 2:
                            browserNames = _context4.sent;


                            browserName = browserName.toLowerCase().split(' ')[0];

                            return _context4.abrupt('return', browserNames.indexOf(browserName) > -1);

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4);
        }))();
    }
};
module.exports = exports['default'];