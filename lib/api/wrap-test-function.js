'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = wrapTestFunction;

var _testController = require('./test-controller');

var _testController2 = _interopRequireDefault(_testController);

var _testRunTracker = require('./test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _errorList = require('../errors/error-list');

var _errorList2 = _interopRequireDefault(_errorList);

var _testRun = require('../errors/test-run');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrapTestFunction(fn) {
    var _this = this;

    return function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(testRun) {
            var result, errList, markeredfn;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            result = null;
                            errList = new _errorList2.default();
                            markeredfn = _testRunTracker2.default.addTrackingMarkerToFunction(testRun.id, fn);


                            testRun.controller = new _testController2.default(testRun);

                            _testRunTracker2.default.ensureEnabled();

                            _context.prev = 5;
                            _context.next = 8;
                            return markeredfn(testRun.controller);

                        case 8:
                            result = _context.sent;
                            _context.next = 14;
                            break;

                        case 11:
                            _context.prev = 11;
                            _context.t0 = _context['catch'](5);

                            errList.addError(_context.t0);

                        case 14:

                            testRun.controller.callsitesWithoutAwait.forEach(function (callsite) {
                                errList.addError(new _testRun.MissingAwaitError(callsite));
                            });

                            if (!errList.hasErrors) {
                                _context.next = 17;
                                break;
                            }

                            throw errList;

                        case 17:
                            return _context.abrupt('return', result);

                        case 18:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[5, 11]]);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }();
}
module.exports = exports['default'];