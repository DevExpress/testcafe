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

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _mapReverse = require('map-reverse');

var _mapReverse2 = _interopRequireDefault(_mapReverse);

var _path = require('path');

var _events = require('events');

var _lodash = require('lodash');

var _bootstrapper = require('./bootstrapper');

var _bootstrapper2 = _interopRequireDefault(_bootstrapper);

var _reporter = require('../reporter');

var _reporter2 = _interopRequireDefault(_reporter);

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _typeAssertions = require('../errors/runtime/type-assertions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_SELECTOR_TIMEOUT = 10000;
var DEFAULT_ASSERTION_TIMEOUT = 3000;
var DEFAULT_PAGE_LOAD_TIMEOUT = 3000;

var Runner = function (_EventEmitter) {
    (0, _inherits3.default)(Runner, _EventEmitter);

    function Runner(proxy, browserConnectionGateway) {
        (0, _classCallCheck3.default)(this, Runner);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.proxy = proxy;
        _this.bootstrapper = new _bootstrapper2.default(browserConnectionGateway);
        _this.pendingTaskPromises = [];

        _this.opts = {
            externalProxyHost: null,
            proxyBypass: null,
            screenshotPath: null,
            takeScreenshotsOnFails: false,
            recordScreenCapture: false,
            skipJsErrors: false,
            quarantineMode: false,
            debugMode: false,
            selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
            pageLoadTimeout: DEFAULT_PAGE_LOAD_TIMEOUT
        };
        return _this;
    }

    Runner._disposeTaskAndRelatedAssets = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(task, browserSet, testedApp) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            task.abort();
                            task.removeAllListeners();

                            _context.next = 4;
                            return Runner._disposeBrowserSetAndTestedApp(browserSet, testedApp);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _disposeTaskAndRelatedAssets(_x, _x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return _disposeTaskAndRelatedAssets;
    }();

    Runner._disposeBrowserSetAndTestedApp = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(browserSet, testedApp) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return browserSet.dispose();

                        case 2:
                            if (!testedApp) {
                                _context2.next = 5;
                                break;
                            }

                            _context2.next = 5;
                            return testedApp.kill();

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _disposeBrowserSetAndTestedApp(_x4, _x5) {
            return _ref2.apply(this, arguments);
        }

        return _disposeBrowserSetAndTestedApp;
    }();

    Runner.prototype._createCancelablePromise = function _createCancelablePromise(taskPromise) {
        var _this2 = this;

        var promise = taskPromise.then(function (_ref3) {
            var completionPromise = _ref3.completionPromise;
            return completionPromise;
        });
        var removeFromPending = function removeFromPending() {
            return (0, _lodash.pull)(_this2.pendingTaskPromises, promise);
        };

        promise.then(removeFromPending).catch(removeFromPending);

        promise.cancel = function () {
            return taskPromise.then(function (_ref4) {
                var cancelTask = _ref4.cancelTask;
                return cancelTask();
            }).then(removeFromPending);
        };

        this.pendingTaskPromises.push(promise);
        return promise;
    };

    // Run task


    Runner.prototype._getTaskResult = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(task, browserSet, reporter, testedApp) {
            var promises;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            task.on('browser-job-done', function (job) {
                                return browserSet.releaseConnection(job.browserConnection);
                            });

                            promises = [(0, _promisifyEvent2.default)(task, 'done'), (0, _promisifyEvent2.default)(browserSet, 'error')];


                            if (testedApp) promises.push(testedApp.errorPromise);

                            _context3.prev = 3;
                            _context3.next = 6;
                            return _pinkie2.default.race(promises);

                        case 6:
                            _context3.next = 13;
                            break;

                        case 8:
                            _context3.prev = 8;
                            _context3.t0 = _context3['catch'](3);
                            _context3.next = 12;
                            return Runner._disposeTaskAndRelatedAssets(task, browserSet, testedApp);

                        case 12:
                            throw _context3.t0;

                        case 13:
                            _context3.next = 15;
                            return Runner._disposeBrowserSetAndTestedApp(browserSet, testedApp);

                        case 15:
                            return _context3.abrupt('return', reporter.testCount - reporter.passed);

                        case 16:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[3, 8]]);
        }));

        function _getTaskResult(_x6, _x7, _x8, _x9) {
            return _ref5.apply(this, arguments);
        }

        return _getTaskResult;
    }();

    Runner.prototype._runTask = function _runTask(reporterPlugins, browserSet, tests, testedApp) {
        var _this3 = this;

        var completed = false;
        var task = new _task2.default(tests, browserSet.browserConnectionGroups, this.proxy, this.opts);
        var reporters = reporterPlugins.map(function (reporter) {
            return new _reporter2.default(reporter.plugin, task, reporter.outStream);
        });
        var completionPromise = this._getTaskResult(task, browserSet, reporters[0], testedApp);

        var setCompleted = function setCompleted() {
            completed = true;
        };

        completionPromise.then(setCompleted).catch(setCompleted);

        var cancelTask = function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (completed) {
                                    _context4.next = 3;
                                    break;
                                }

                                _context4.next = 3;
                                return Runner._disposeTaskAndRelatedAssets(task, browserSet, testedApp);

                            case 3:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, _this3);
            }));

            return function cancelTask() {
                return _ref6.apply(this, arguments);
            };
        }();

        return { completionPromise: completionPromise, cancelTask: cancelTask };
    };

    Runner.prototype._registerAssets = function _registerAssets(assets) {
        var _this4 = this;

        assets.forEach(function (asset) {
            return _this4.proxy.GET(asset.path, asset.info);
        });
    };

    Runner.prototype._validateRunOptions = function _validateRunOptions() {
        var concurrency = this.bootstrapper.concurrency;
        var speed = this.opts.speed;
        var proxyBypass = this.opts.proxyBypass;

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0.01 || speed > 1) throw new _runtime.GeneralError(_message2.default.invalidSpeedValue);

        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1) throw new _runtime.GeneralError(_message2.default.invalidConcurrencyFactor);

        if (proxyBypass) {
            (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.array], null, '"proxyBypass" argument', proxyBypass);

            if (typeof proxyBypass === 'string') proxyBypass = [proxyBypass];

            proxyBypass = proxyBypass.reduce(function (arr, rules) {
                (0, _typeAssertions.assertType)(_typeAssertions.is.string, null, '"proxyBypass" argument', rules);

                return arr.concat(rules.split(','));
            }, []);

            this.opts.proxyBypass = proxyBypass;
        }
    };

    // API


    Runner.prototype.embeddingOptions = function embeddingOptions(opts) {
        this._registerAssets(opts.assets);
        this.opts.TestRunCtor = opts.TestRunCtor;

        return this;
    };

    Runner.prototype.src = function src() {
        for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
            sources[_key] = arguments[_key];
        }

        sources = (0, _lodash.flattenDeep)(sources).map(function (path) {
            return (0, _path.resolve)(path);
        });

        this.bootstrapper.sources = this.bootstrapper.sources.concat(sources);

        return this;
    };

    Runner.prototype.browsers = function browsers() {
        for (var _len2 = arguments.length, _browsers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            _browsers[_key2] = arguments[_key2];
        }

        this.bootstrapper.browsers = this.bootstrapper.browsers.concat((0, _lodash.flattenDeep)(_browsers));

        return this;
    };

    Runner.prototype.concurrency = function concurrency(_concurrency) {
        this.bootstrapper.concurrency = _concurrency;

        return this;
    };

    Runner.prototype.reporter = function reporter(name, outStream) {
        this.bootstrapper.reporters.push({
            name: name,
            outStream: outStream
        });

        return this;
    };

    Runner.prototype.filter = function filter(_filter) {
        this.bootstrapper.filter = _filter;

        return this;
    };

    Runner.prototype.useProxy = function useProxy(externalProxyHost, proxyBypass) {
        this.opts.externalProxyHost = externalProxyHost;
        this.opts.proxyBypass = proxyBypass;

        return this;
    };

    Runner.prototype.screenshots = function screenshots(path) {
        var takeOnFails = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var recordScreenCapture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        this.opts.takeScreenshotsOnFails = takeOnFails;
        this.opts.screenshotPath = path;
        this.opts.recordScreenCapture = recordScreenCapture;

        return this;
    };

    Runner.prototype.startApp = function startApp(command, initDelay) {
        this.bootstrapper.appCommand = command;
        this.bootstrapper.appInitDelay = initDelay;

        return this;
    };

    Runner.prototype.run = function run() {
        var _this5 = this;

        var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            skipJsErrors = _ref7.skipJsErrors,
            disablePageReloads = _ref7.disablePageReloads,
            quarantineMode = _ref7.quarantineMode,
            debugMode = _ref7.debugMode,
            selectorTimeout = _ref7.selectorTimeout,
            assertionTimeout = _ref7.assertionTimeout,
            pageLoadTimeout = _ref7.pageLoadTimeout,
            _ref7$speed = _ref7.speed,
            speed = _ref7$speed === undefined ? 1 : _ref7$speed,
            debugOnFail = _ref7.debugOnFail;

        this.opts.skipJsErrors = !!skipJsErrors;
        this.opts.disablePageReloads = !!disablePageReloads;
        this.opts.quarantineMode = !!quarantineMode;
        this.opts.debugMode = !!debugMode;
        this.opts.debugOnFail = !!debugOnFail;
        this.opts.selectorTimeout = selectorTimeout === void 0 ? DEFAULT_SELECTOR_TIMEOUT : selectorTimeout;
        this.opts.assertionTimeout = assertionTimeout === void 0 ? DEFAULT_ASSERTION_TIMEOUT : assertionTimeout;
        this.opts.pageLoadTimeout = pageLoadTimeout === void 0 ? DEFAULT_PAGE_LOAD_TIMEOUT : pageLoadTimeout;

        this.opts.speed = speed;

        var runTaskPromise = _pinkie2.default.resolve().then(function () {
            _this5._validateRunOptions();
            return _this5.bootstrapper.createRunnableConfiguration();
        }).then(function (_ref8) {
            var reporterPlugins = _ref8.reporterPlugins,
                browserSet = _ref8.browserSet,
                tests = _ref8.tests,
                testedApp = _ref8.testedApp;

            _this5.emit('done-bootstrapping');

            return _this5._runTask(reporterPlugins, browserSet, tests, testedApp);
        });

        return this._createCancelablePromise(runTaskPromise);
    };

    Runner.prototype.stop = function () {
        var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var cancellationPromises;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            // NOTE: When taskPromise is cancelled, it is removed from
                            // the pendingTaskPromises array, which leads to shifting indexes
                            // towards the beginning. So, we must copy the array in order to iterate it,
                            // or we can perform iteration from the end to the beginning.
                            cancellationPromises = (0, _mapReverse2.default)(this.pendingTaskPromises, function (taskPromise) {
                                return taskPromise.cancel();
                            });
                            _context5.next = 3;
                            return _pinkie2.default.all(cancellationPromises);

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function stop() {
            return _ref9.apply(this, arguments);
        }

        return stop;
    }();

    return Runner;
}(_events.EventEmitter);

exports.default = Runner;
module.exports = exports['default'];