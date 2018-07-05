'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _phase = require('../test-run/phase');

var _phase2 = _interopRequireDefault(_phase);

var _processTestFnError = require('../errors/process-test-fn-error');

var _processTestFnError2 = _interopRequireDefault(_processTestFnError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FixtureHookController = function () {
    function FixtureHookController(tests, browserConnectionCount) {
        (0, _classCallCheck3.default)(this, FixtureHookController);

        this.fixtureMap = FixtureHookController._createFixtureMap(tests, browserConnectionCount);
    }

    FixtureHookController._ensureFixtureMapItem = function _ensureFixtureMapItem(fixtureMap, fixture) {
        if (!fixtureMap.has(fixture)) {
            var item = {
                started: false,
                runningFixtureBeforeHook: false,
                fixtureBeforeHookErr: null,
                pendingTestRunCount: 0,
                fixtureCtx: (0, _create2.default)(null)
            };

            fixtureMap.set(fixture, item);
        }
    };

    FixtureHookController._createFixtureMap = function _createFixtureMap(tests, browserConnectionCount) {
        return tests.reduce(function (fixtureMap, test) {
            var fixture = test.fixture;

            if (!test.skip) {
                FixtureHookController._ensureFixtureMapItem(fixtureMap, fixture);

                var item = fixtureMap.get(fixture);

                item.pendingTestRunCount += browserConnectionCount;
            }

            return fixtureMap;
        }, new _map2.default());
    };

    FixtureHookController.prototype._getFixtureMapItem = function _getFixtureMapItem(test) {
        return test.skip ? null : this.fixtureMap.get(test.fixture);
    };

    FixtureHookController.prototype.isTestBlocked = function isTestBlocked(test) {
        var item = this._getFixtureMapItem(test);

        return item && item.runningFixtureBeforeHook;
    };

    FixtureHookController.prototype.runFixtureBeforeHookIfNecessary = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(testRun) {
            var fixture, item, shouldRunBeforeHook;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            fixture = testRun.test.fixture;
                            item = this._getFixtureMapItem(testRun.test);

                            if (!item) {
                                _context.next = 21;
                                break;
                            }

                            shouldRunBeforeHook = !item.started && fixture.beforeFn;


                            item.started = true;

                            if (!shouldRunBeforeHook) {
                                _context.next = 16;
                                break;
                            }

                            item.runningFixtureBeforeHook = true;

                            _context.prev = 7;
                            _context.next = 10;
                            return fixture.beforeFn(item.fixtureCtx);

                        case 10:
                            _context.next = 15;
                            break;

                        case 12:
                            _context.prev = 12;
                            _context.t0 = _context['catch'](7);

                            item.fixtureBeforeHookErr = (0, _processTestFnError2.default)(_context.t0);

                        case 15:

                            item.runningFixtureBeforeHook = false;

                        case 16:
                            if (!item.fixtureBeforeHookErr) {
                                _context.next = 20;
                                break;
                            }

                            testRun.phase = _phase2.default.inFixtureBeforeHook;

                            testRun.addError(item.fixtureBeforeHookErr);

                            return _context.abrupt('return', false);

                        case 20:

                            testRun.fixtureCtx = item.fixtureCtx;

                        case 21:
                            return _context.abrupt('return', true);

                        case 22:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[7, 12]]);
        }));

        function runFixtureBeforeHookIfNecessary(_x) {
            return _ref.apply(this, arguments);
        }

        return runFixtureBeforeHookIfNecessary;
    }();

    FixtureHookController.prototype.runFixtureAfterHookIfNecessary = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(testRun) {
            var fixture, item;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            fixture = testRun.test.fixture;
                            item = this._getFixtureMapItem(testRun.test);

                            if (!item) {
                                _context2.next = 14;
                                break;
                            }

                            item.pendingTestRunCount--;

                            if (!(item.pendingTestRunCount === 0 && fixture.afterFn)) {
                                _context2.next = 14;
                                break;
                            }

                            testRun.phase = _phase2.default.inFixtureAfterHook;

                            _context2.prev = 6;
                            _context2.next = 9;
                            return fixture.afterFn(item.fixtureCtx);

                        case 9:
                            _context2.next = 14;
                            break;

                        case 11:
                            _context2.prev = 11;
                            _context2.t0 = _context2['catch'](6);

                            testRun.addError((0, _processTestFnError2.default)(_context2.t0));

                        case 14:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[6, 11]]);
        }));

        function runFixtureAfterHookIfNecessary(_x2) {
            return _ref2.apply(this, arguments);
        }

        return runFixtureAfterHookIfNecessary;
    }();

    return FixtureHookController;
}();

exports.default = FixtureHookController;
module.exports = exports['default'];