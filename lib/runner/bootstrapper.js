'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _compiler = require('../compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _connection = require('../browser/connection');

var _connection2 = _interopRequireDefault(_connection);

var _runtime = require('../errors/runtime');

var _pool = require('../browser/provider/pool');

var _pool2 = _interopRequireDefault(_pool);

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _browserSet = require('./browser-set');

var _browserSet2 = _interopRequireDefault(_browserSet);

var _testedApp = require('./tested-app');

var _testedApp2 = _interopRequireDefault(_testedApp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_APP_INIT_DELAY = 1000;

var Bootstrapper = function () {
    function Bootstrapper(browserConnectionGateway) {
        (0, _classCallCheck3.default)(this, Bootstrapper);

        this.browserConnectionGateway = browserConnectionGateway;

        this.concurrency = 1;
        this.sources = [];
        this.browsers = [];
        this.reporters = [];
        this.filter = null;
        this.appCommand = null;
        this.appInitDelay = DEFAULT_APP_INIT_DELAY;
    }

    Bootstrapper._splitBrowserInfo = function _splitBrowserInfo(browserInfo) {
        var remotes = [];
        var automated = [];

        browserInfo.forEach(function (browser) {
            if (browser instanceof _connection2.default) remotes.push(browser);else automated.push(browser);
        });

        return { remotes: remotes, automated: automated };
    };

    Bootstrapper.prototype._getBrowserInfo = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var browserInfo;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (this.browsers.length) {
                                _context.next = 2;
                                break;
                            }

                            throw new _runtime.GeneralError(_message2.default.browserNotSet);

                        case 2:
                            _context.next = 4;
                            return _pinkie2.default.all(this.browsers.map(function (browser) {
                                return _pool2.default.getBrowserInfo(browser);
                            }));

                        case 4:
                            browserInfo = _context.sent;
                            return _context.abrupt('return', (0, _lodash.flatten)(browserInfo));

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _getBrowserInfo() {
            return _ref.apply(this, arguments);
        }

        return _getBrowserInfo;
    }();

    Bootstrapper.prototype._createAutomatedConnections = function _createAutomatedConnections(browserInfo) {
        var _this = this;

        if (!browserInfo) return [];

        return browserInfo.map(function (browser) {
            return (0, _lodash.times)(_this.concurrency, function () {
                return new _connection2.default(_this.browserConnectionGateway, browser);
            });
        });
    };

    Bootstrapper.prototype._getBrowserConnections = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(browserInfo) {
            var _Bootstrapper$_splitB, automated, remotes, browserConnections;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _Bootstrapper$_splitB = Bootstrapper._splitBrowserInfo(browserInfo), automated = _Bootstrapper$_splitB.automated, remotes = _Bootstrapper$_splitB.remotes;

                            if (!(remotes && remotes.length % this.concurrency)) {
                                _context2.next = 3;
                                break;
                            }

                            throw new _runtime.GeneralError(_message2.default.cannotDivideRemotesCountByConcurrency);

                        case 3:
                            browserConnections = this._createAutomatedConnections(automated);


                            browserConnections = browserConnections.concat((0, _lodash.chunk)(remotes, this.concurrency));

                            _context2.next = 7;
                            return _browserSet2.default.from(browserConnections);

                        case 7:
                            return _context2.abrupt('return', _context2.sent);

                        case 8:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _getBrowserConnections(_x) {
            return _ref2.apply(this, arguments);
        }

        return _getBrowserConnections;
    }();

    Bootstrapper.prototype._getTests = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var _this2 = this;

            var compiler, tests, testsWithOnlyFlag;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (this.sources.length) {
                                _context3.next = 2;
                                break;
                            }

                            throw new _runtime.GeneralError(_message2.default.testSourcesNotSet);

                        case 2:
                            compiler = new _compiler2.default(this.sources);
                            _context3.next = 5;
                            return compiler.getTests();

                        case 5:
                            tests = _context3.sent;
                            testsWithOnlyFlag = tests.filter(function (test) {
                                return test.only;
                            });


                            if (testsWithOnlyFlag.length) tests = testsWithOnlyFlag;

                            if (this.filter) tests = tests.filter(function (test) {
                                return _this2.filter(test.name, test.fixture.name, test.fixture.path);
                            });

                            if (tests.length) {
                                _context3.next = 11;
                                break;
                            }

                            throw new _runtime.GeneralError(_message2.default.noTestsToRun);

                        case 11:
                            return _context3.abrupt('return', tests);

                        case 12:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _getTests() {
            return _ref3.apply(this, arguments);
        }

        return _getTests;
    }();

    Bootstrapper.prototype._getReporterPlugins = function _getReporterPlugins() {
        var stdoutReporters = (0, _lodash.filter)(this.reporters, function (r) {
            return (0, _lodash.isUndefined)(r.outStream) || r.outStream === process.stdout;
        });

        if (stdoutReporters.length > 1) throw new _runtime.GeneralError(_message2.default.multipleStdoutReporters, stdoutReporters.map(function (r) {
            return r.name;
        }).join(', '));

        if (!this.reporters.length) {
            this.reporters.push({
                name: 'spec',
                outStream: process.stdout
            });
        }

        return this.reporters.map(function (_ref4) {
            var name = _ref4.name,
                outStream = _ref4.outStream;

            var pluginFactory = name;

            if (typeof pluginFactory !== 'function') {
                try {
                    pluginFactory = require('testcafe-reporter-' + name);
                } catch (err) {
                    throw new _runtime.GeneralError(_message2.default.cantFindReporterForAlias, name);
                }
            }

            return {
                plugin: pluginFactory(),
                outStream: outStream
            };
        });
    };

    Bootstrapper.prototype._startTestedApp = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var testedApp;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!this.appCommand) {
                                _context4.next = 5;
                                break;
                            }

                            testedApp = new _testedApp2.default();
                            _context4.next = 4;
                            return testedApp.start(this.appCommand, this.appInitDelay);

                        case 4:
                            return _context4.abrupt('return', testedApp);

                        case 5:
                            return _context4.abrupt('return', null);

                        case 6:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function _startTestedApp() {
            return _ref5.apply(this, arguments);
        }

        return _startTestedApp;
    }();

    // API


    Bootstrapper.prototype.createRunnableConfiguration = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var reporterPlugins, browserInfo, tests, testedApp, browserSet;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            reporterPlugins = this._getReporterPlugins();

                            // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
                            // considered as the browser argument, and the tests path argument will have the predefined default value.
                            // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
                            // So, we need to retrieve the browser aliases and paths before tests compilation.

                            _context5.next = 3;
                            return this._getBrowserInfo();

                        case 3:
                            browserInfo = _context5.sent;
                            _context5.next = 6;
                            return this._getTests();

                        case 6:
                            tests = _context5.sent;
                            _context5.next = 9;
                            return this._startTestedApp();

                        case 9:
                            testedApp = _context5.sent;
                            _context5.next = 12;
                            return this._getBrowserConnections(browserInfo);

                        case 12:
                            browserSet = _context5.sent;
                            return _context5.abrupt('return', { reporterPlugins: reporterPlugins, browserSet: browserSet, tests: tests, testedApp: testedApp });

                        case 14:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function createRunnableConfiguration() {
            return _ref6.apply(this, arguments);
        }

        return createRunnableConfiguration;
    }();

    return Bootstrapper;
}();

exports.default = Bootstrapper;
module.exports = exports['default'];