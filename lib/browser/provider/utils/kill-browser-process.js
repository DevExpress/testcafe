'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var findProcessWin = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(processOptions) {
        var cmd, wmicOutput, processList;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        cmd = 'wmic process where "commandline like \'%' + processOptions.arguments + '%\' and name <> \'cmd.exe\' and name <> \'wmic.exe\'" get processid';
                        _context.next = 3;
                        return (0, _promisifiedFunctions.exec)(cmd);

                    case 3:
                        wmicOutput = _context.sent;
                        processList = wmicOutput.split(/\s*\n/);


                        processList = processList
                        // NOTE: remove list's header and empty last element, caused by trailing newline
                        .slice(1, -1).map(function (pid) {
                            return { pid: Number(pid) };
                        });

                        return _context.abrupt('return', processList);

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function findProcessWin(_x) {
        return _ref.apply(this, arguments);
    };
}();

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _promisifiedFunctions = require('../../../utils/promisified-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BROWSER_CLOSING_TIMEOUT = 5;

exports.default = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(browserId) {
        var processOptions, processList;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        processOptions = { arguments: browserId, psargs: 'aux' };

                        if (!_osFamily2.default.win) {
                            _context2.next = 7;
                            break;
                        }

                        _context2.next = 4;
                        return findProcessWin(processOptions);

                    case 4:
                        _context2.t0 = _context2.sent;
                        _context2.next = 10;
                        break;

                    case 7:
                        _context2.next = 9;
                        return (0, _promisifiedFunctions.findProcess)(processOptions);

                    case 9:
                        _context2.t0 = _context2.sent;

                    case 10:
                        processList = _context2.t0;

                        if (processList.length) {
                            _context2.next = 13;
                            break;
                        }

                        return _context2.abrupt('return', true);

                    case 13:
                        _context2.prev = 13;

                        if (!_osFamily2.default.win) {
                            _context2.next = 18;
                            break;
                        }

                        process.kill(processList[0].pid);
                        _context2.next = 20;
                        break;

                    case 18:
                        _context2.next = 20;
                        return (0, _promisifiedFunctions.killProcess)(processList[0].pid, { timeout: BROWSER_CLOSING_TIMEOUT });

                    case 20:
                        return _context2.abrupt('return', true);

                    case 23:
                        _context2.prev = 23;
                        _context2.t1 = _context2['catch'](13);
                        return _context2.abrupt('return', false);

                    case 26:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[13, 23]]);
    }));

    return function (_x2) {
        return _ref2.apply(this, arguments);
    };
}();

module.exports = exports['default'];