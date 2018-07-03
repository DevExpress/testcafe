'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.createRole = createRole;
exports.createAnonymousRole = createAnonymousRole;

var _events = require('events');

var _nanoid = require('nanoid');

var _nanoid2 = _interopRequireDefault(_nanoid);

var _phase = require('./phase');

var _phase2 = _interopRequireDefault(_phase);

var _typeAssertions = require('../errors/runtime/type-assertions');

var _wrapTestFunction = require('../api/wrap-test-function');

var _wrapTestFunction2 = _interopRequireDefault(_wrapTestFunction);

var _testPageUrl = require('../api/test-page-url');

var _actions = require('../test-run/commands/actions');

var _markerSymbol = require('./marker-symbol');

var _markerSymbol2 = _interopRequireDefault(_markerSymbol);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COOKIE_SYNC_DELAY = 100;

var Role = function (_EventEmitter) {
    (0, _inherits3.default)(Role, _EventEmitter);

    function Role(loginPage, initFn) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        (0, _classCallCheck3.default)(this, Role);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this[_markerSymbol2.default] = true;

        _this.id = (0, _nanoid2.default)(7);
        _this.phase = loginPage ? _phase2.default.uninitialized : _phase2.default.initialized;

        _this.loginPage = loginPage;
        _this.initFn = initFn;
        _this.opts = options;

        _this.url = null;
        _this.stateSnapshot = null;
        _this.initErr = null;
        return _this;
    }

    Role.prototype._navigateToLoginPage = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(testRun) {
            var navigateCommand;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            navigateCommand = new _actions.NavigateToCommand({ url: this.loginPage });
                            _context.next = 3;
                            return testRun.executeCommand(navigateCommand);

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _navigateToLoginPage(_x2) {
            return _ref.apply(this, arguments);
        }

        return _navigateToLoginPage;
    }();

    Role.prototype._storeStateSnapshot = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(testRun) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (this.initErr) {
                                _context2.next = 6;
                                break;
                            }

                            _context2.next = 3;
                            return (0, _delay2.default)(COOKIE_SYNC_DELAY);

                        case 3:
                            _context2.next = 5;
                            return testRun.getStateSnapshot();

                        case 5:
                            this.stateSnapshot = _context2.sent;

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _storeStateSnapshot(_x3) {
            return _ref2.apply(this, arguments);
        }

        return _storeStateSnapshot;
    }();

    Role.prototype._executeInitFn = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(testRun) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;

                            testRun.disableDebugBreakpoints = false;
                            _context3.next = 4;
                            return this.initFn(testRun);

                        case 4:
                            _context3.next = 9;
                            break;

                        case 6:
                            _context3.prev = 6;
                            _context3.t0 = _context3['catch'](0);

                            this.initErr = _context3.t0;

                        case 9:
                            _context3.prev = 9;

                            testRun.disableDebugBreakpoints = true;
                            return _context3.finish(9);

                        case 12:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 6, 9, 12]]);
        }));

        function _executeInitFn(_x4) {
            return _ref3.apply(this, arguments);
        }

        return _executeInitFn;
    }();

    Role.prototype.initialize = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(testRun) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            this.phase = _phase2.default.pendingInitialization;

                            _context4.next = 3;
                            return testRun.switchToCleanRun();

                        case 3:
                            _context4.next = 5;
                            return this._navigateToLoginPage(testRun);

                        case 5:
                            _context4.next = 7;
                            return this._executeInitFn(testRun);

                        case 7:
                            _context4.next = 9;
                            return this._storeStateSnapshot(testRun);

                        case 9:
                            if (!this.opts.preserveUrl) {
                                _context4.next = 13;
                                break;
                            }

                            _context4.next = 12;
                            return testRun.getCurrentUrl();

                        case 12:
                            this.url = _context4.sent;

                        case 13:

                            this.phase = _phase2.default.initialized;
                            this.emit('initialized');

                        case 15:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function initialize(_x5) {
            return _ref4.apply(this, arguments);
        }

        return initialize;
    }();

    return Role;
}(_events.EventEmitter);

function createRole(loginPage, initFn) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'Role', '"loginPage" argument', loginPage);
    (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'Role', '"initFn" argument', initFn);
    (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'Role', '"options" argument', options);

    if (options.preserveUrl !== void 0) (0, _typeAssertions.assertType)(_typeAssertions.is.boolean, 'Role', '"preserveUrl" option', options.preserveUrl);

    loginPage = (0, _testPageUrl.resolvePageUrl)(loginPage);
    initFn = (0, _wrapTestFunction2.default)(initFn);

    return new Role(loginPage, initFn, options);
}

function createAnonymousRole() {
    return new Role(null, null);
}