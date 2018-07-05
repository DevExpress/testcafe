'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Validations
var getValidHostname = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(hostname) {
        var valid;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!hostname) {
                            _context.next = 8;
                            break;
                        }

                        _context.next = 3;
                        return endpointUtils.isMyHostname(hostname);

                    case 3:
                        valid = _context.sent;

                        if (valid) {
                            _context.next = 6;
                            break;
                        }

                        throw new _runtime.GeneralError(_message2.default.invalidHostname, hostname);

                    case 6:
                        _context.next = 9;
                        break;

                    case 8:
                        hostname = endpointUtils.getIPAddress();

                    case 9:
                        return _context.abrupt('return', hostname);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getValidHostname(_x) {
        return _ref.apply(this, arguments);
    };
}();

var getValidPort = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(port) {
        var isFree;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!port) {
                            _context2.next = 8;
                            break;
                        }

                        _context2.next = 3;
                        return endpointUtils.isFreePort(port);

                    case 3:
                        isFree = _context2.sent;

                        if (isFree) {
                            _context2.next = 6;
                            break;
                        }

                        throw new _runtime.GeneralError(_message2.default.portIsNotFree, port);

                    case 6:
                        _context2.next = 11;
                        break;

                    case 8:
                        _context2.next = 10;
                        return endpointUtils.getFreePort();

                    case 10:
                        port = _context2.sent;

                    case 11:
                        return _context2.abrupt('return', port);

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getValidPort(_x2) {
        return _ref2.apply(this, arguments);
    };
}();

// API


var createTestCafe = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(hostname, port1, port2, sslOptions) {
        var _ref4, testcafe;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return _pinkie2.default.all([getValidHostname(hostname), getValidPort(port1), getValidPort(port2)]);

                    case 2:
                        _ref4 = _context3.sent;
                        hostname = _ref4[0];
                        port1 = _ref4[1];
                        port2 = _ref4[2];
                        testcafe = new _testcafe2.default(hostname, port1, port2, sslOptions);


                        (0, _asyncExitHook2.default)(function (cb) {
                            return testcafe.close().then(cb);
                        });

                        return _context3.abrupt('return', testcafe);

                    case 9:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function createTestCafe(_x3, _x4, _x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

// Embedding utils


var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _testcafe = require('./testcafe');

var _testcafe2 = _interopRequireDefault(_testcafe);

var _endpointUtils = require('endpoint-utils');

var endpointUtils = _interopRequireWildcard(_endpointUtils);

var _asyncExitHook = require('async-exit-hook');

var _asyncExitHook2 = _interopRequireDefault(_asyncExitHook);

var _runtime = require('./errors/runtime');

var _message = require('./errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _embeddingUtils = require('./embedding-utils');

var _embeddingUtils2 = _interopRequireDefault(_embeddingUtils);

var _exportableLib = require('./api/exportable-lib');

var _exportableLib2 = _interopRequireDefault(_exportableLib);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

createTestCafe.embeddingUtils = _embeddingUtils2.default;

// Common API
(0, _keys2.default)(_exportableLib2.default).forEach(function (key) {
    createTestCafe[key] = _exportableLib2.default[key];
});

exports.default = createTestCafe;
module.exports = exports['default'];