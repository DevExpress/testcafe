'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _lodash = require('lodash');

var _readFileRelative = require('read-file-relative');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _debugLogger = require('../notifications/debug-logger');

var _debugLogger2 = _interopRequireDefault(_debugLogger);

var _sessionController = require('./session-controller');

var _sessionController2 = _interopRequireDefault(_sessionController);

var _debugLog = require('./debug-log');

var _debugLog2 = _interopRequireDefault(_debugLog);

var _formattableAdapter = require('../errors/test-run/formattable-adapter');

var _formattableAdapter2 = _interopRequireDefault(_formattableAdapter);

var _errorList = require('../errors/error-list');

var _errorList2 = _interopRequireDefault(_errorList);

var _executeJsExpression = require('./execute-js-expression');

var _testRun = require('../errors/test-run/');

var _browserManipulationQueue = require('./browser-manipulation-queue');

var _browserManipulationQueue2 = _interopRequireDefault(_browserManipulationQueue);

var _phase = require('./phase');

var _phase2 = _interopRequireDefault(_phase);

var _clientMessages = require('./client-messages');

var _clientMessages2 = _interopRequireDefault(_clientMessages);

var _type = require('./commands/type');

var _type2 = _interopRequireDefault(_type);

var _executor = require('../assertions/executor');

var _executor2 = _interopRequireDefault(_executor);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _markerSymbol = require('./marker-symbol');

var _markerSymbol2 = _interopRequireDefault(_markerSymbol);

var _testRunTracker = require('../api/test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _phase3 = require('../role/phase');

var _phase4 = _interopRequireDefault(_phase3);

var _bookmark = require('./bookmark');

var _bookmark2 = _interopRequireDefault(_bookmark);

var _clientFunctionBuilder = require('../client-functions/client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _pluginHost = require('../reporter/plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

var _browserConsoleMessages = require('./browser-console-messages');

var _browserConsoleMessages2 = _interopRequireDefault(_browserConsoleMessages);

var _browserManipulation = require('./commands/browser-manipulation');

var _actions = require('./commands/actions');

var _service = require('./commands/service');

var _utils = require('./commands/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Const
var TEST_RUN_TEMPLATE = (0, _readFileRelative.readSync)('../client/test-run/index.js.mustache');
var IFRAME_TEST_RUN_TEMPLATE = (0, _readFileRelative.readSync)('../client/test-run/iframe.js.mustache');
var TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
var MAX_RESPONSE_DELAY = 2 * 60 * 1000;

var ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT = 'all-driver-tasks-added-to-queue';

var TestRun = function (_EventEmitter) {
    (0, _inherits3.default)(TestRun, _EventEmitter);

    function TestRun(test, browserConnection, screenshotCapturer, warningLog, opts) {
        (0, _classCallCheck3.default)(this, TestRun);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this[_markerSymbol2.default] = true;

        _this.opts = opts;
        _this.test = test;
        _this.browserConnection = browserConnection;

        _this.phase = _phase2.default.initial;

        _this.driverTaskQueue = [];
        _this.testDoneCommandQueued = false;

        _this.activeDialogHandler = null;
        _this.activeIframeSelector = null;
        _this.speed = _this.opts.speed;
        _this.pageLoadTimeout = _this.opts.pageLoadTimeout;

        _this.disablePageReloads = test.disablePageReloads || opts.disablePageReloads && test.disablePageReloads !== false;

        _this.session = _sessionController2.default.getSession(_this);

        _this.consoleMessages = new _browserConsoleMessages2.default();

        _this.pendingRequest = null;
        _this.pendingPageError = null;

        _this.controller = null;
        _this.ctx = (0, _create2.default)(null);
        _this.fixtureCtx = null;

        _this.currentRoleId = null;
        _this.usedRoleStates = (0, _create2.default)(null);

        _this.errs = [];

        _this.lastDriverStatusId = null;
        _this.lastDriverStatusResponse = null;

        _this.fileDownloadingHandled = false;
        _this.resolveWaitForFileDownloadingPromise = null;

        _this.addingDriverTasksCount = 0;

        _this.debugging = _this.opts.debugMode;
        _this.debugOnFail = _this.opts.debugOnFail;
        _this.disableDebugBreakpoints = false;
        _this.debugReporterPluginHost = new _pluginHost2.default({ noColors: false });

        _this.browserManipulationQueue = new _browserManipulationQueue2.default(browserConnection, screenshotCapturer, warningLog);

        _this.debugLog = new _debugLog2.default(_this.browserConnection.userAgent);

        _this.quarantine = null;

        _this.injectable.scripts.push('/testcafe-core.js');
        _this.injectable.scripts.push('/testcafe-ui.js');
        _this.injectable.scripts.push('/testcafe-automation.js');
        _this.injectable.scripts.push('/testcafe-driver.js');
        _this.injectable.styles.push('/testcafe-ui-styles.css');

        _this.requestHooks = (0, _from2.default)(_this.test.requestHooks);

        _this._initRequestHooks();
        return _this;
    }

    TestRun.prototype.addQuarantineInfo = function addQuarantineInfo(quarantine) {
        this.quarantine = quarantine;
    };

    TestRun.prototype.addRequestHook = function addRequestHook(hook) {
        if (this.requestHooks.indexOf(hook) !== -1) return;

        this.requestHooks.push(hook);
        this._initRequestHook(hook);
    };

    TestRun.prototype.removeRequestHook = function removeRequestHook(hook) {
        if (this.requestHooks.indexOf(hook) === -1) return;

        (0, _lodash.pull)(this.requestHooks, hook);
        this._disposeRequestHook(hook);
    };

    TestRun.prototype._initRequestHook = function _initRequestHook(hook) {
        var _this2 = this;

        hook._instantiateRequestFilterRules();
        hook._instantiatedRequestFilterRules.forEach(function (rule) {
            _this2.session.addRequestEventListeners(rule, {
                onRequest: hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse: hook.onResponse.bind(hook)
            });
        });
    };

    TestRun.prototype._disposeRequestHook = function _disposeRequestHook(hook) {
        var _this3 = this;

        hook._instantiatedRequestFilterRules.forEach(function (rule) {
            _this3.session.removeRequestEventListeners(rule);
        });
    };

    TestRun.prototype._initRequestHooks = function _initRequestHooks() {
        var _this4 = this;

        this.requestHooks.forEach(function (hook) {
            return _this4._initRequestHook(hook);
        });
    };

    // Hammerhead payload


    TestRun.prototype._getPayloadScript = function _getPayloadScript() {
        this.fileDownloadingHandled = false;
        this.resolveWaitForFileDownloadingPromise = null;

        return _mustache2.default.render(TEST_RUN_TEMPLATE, {
            testRunId: (0, _stringify2.default)(this.session.id),
            browserId: (0, _stringify2.default)(this.browserConnection.id),
            browserHeartbeatRelativeUrl: (0, _stringify2.default)(this.browserConnection.heartbeatRelativeUrl),
            browserStatusRelativeUrl: (0, _stringify2.default)(this.browserConnection.statusRelativeUrl),
            browserStatusDoneRelativeUrl: (0, _stringify2.default)(this.browserConnection.statusDoneRelativeUrl),
            userAgent: (0, _stringify2.default)(this.browserConnection.userAgent),
            testName: (0, _stringify2.default)(this.test.name),
            fixtureName: (0, _stringify2.default)(this.test.fixture.name),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            skipJsErrors: this.opts.skipJsErrors,
            speed: this.speed,
            dialogHandler: (0, _stringify2.default)(this.activeDialogHandler)
        });
    };

    TestRun.prototype._getIframePayloadScript = function _getIframePayloadScript() {
        return _mustache2.default.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId: (0, _stringify2.default)(this.session.id),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            speed: this.speed,
            dialogHandler: (0, _stringify2.default)(this.activeDialogHandler)
        });
    };

    // Hammerhead handlers


    TestRun.prototype.getAuthCredentials = function getAuthCredentials() {
        return this.test.authCredentials;
    };

    TestRun.prototype.handleFileDownload = function handleFileDownload() {
        if (this.resolveWaitForFileDownloadingPromise) {
            this.resolveWaitForFileDownloadingPromise(true);
            this.resolveWaitForFileDownloadingPromise = null;
        } else this.fileDownloadingHandled = true;
    };

    TestRun.prototype.handlePageError = function handlePageError(ctx, err) {
        this.pendingPageError = new _testRun.PageLoadError(err);

        ctx.redirect(ctx.toProxyUrl('about:error'));
    };

    // Test function execution


    TestRun.prototype._executeTestFn = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(phase, fn) {
            var screenshotPath;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            this.phase = phase;

                            _context.prev = 1;
                            _context.next = 4;
                            return fn(this);

                        case 4:
                            _context.next = 15;
                            break;

                        case 6:
                            _context.prev = 6;
                            _context.t0 = _context['catch'](1);
                            screenshotPath = null;

                            if (!this.opts.takeScreenshotsOnFails) {
                                _context.next = 13;
                                break;
                            }

                            _context.next = 12;
                            return this.executeCommand(new _browserManipulation.TakeScreenshotOnFailCommand());

                        case 12:
                            screenshotPath = _context.sent;

                        case 13:

                            this.addError(_context.t0, screenshotPath);
                            return _context.abrupt('return', false);

                        case 15:
                            return _context.abrupt('return', !this._addPendingPageErrorIfAny());

                        case 16:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[1, 6]]);
        }));

        function _executeTestFn(_x, _x2) {
            return _ref.apply(this, arguments);
        }

        return _executeTestFn;
    }();

    TestRun.prototype._runBeforeHook = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!this.test.beforeFn) {
                                _context2.next = 4;
                                break;
                            }

                            _context2.next = 3;
                            return this._executeTestFn(_phase2.default.inTestBeforeHook, this.test.beforeFn);

                        case 3:
                            return _context2.abrupt('return', _context2.sent);

                        case 4:
                            if (!this.test.fixture.beforeEachFn) {
                                _context2.next = 8;
                                break;
                            }

                            _context2.next = 7;
                            return this._executeTestFn(_phase2.default.inFixtureBeforeEachHook, this.test.fixture.beforeEachFn);

                        case 7:
                            return _context2.abrupt('return', _context2.sent);

                        case 8:
                            return _context2.abrupt('return', true);

                        case 9:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _runBeforeHook() {
            return _ref2.apply(this, arguments);
        }

        return _runBeforeHook;
    }();

    TestRun.prototype._runAfterHook = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!this.test.afterFn) {
                                _context3.next = 4;
                                break;
                            }

                            _context3.next = 3;
                            return this._executeTestFn(_phase2.default.inTestAfterHook, this.test.afterFn);

                        case 3:
                            return _context3.abrupt('return', _context3.sent);

                        case 4:
                            if (!this.test.fixture.afterEachFn) {
                                _context3.next = 8;
                                break;
                            }

                            _context3.next = 7;
                            return this._executeTestFn(_phase2.default.inFixtureAfterEachHook, this.test.fixture.afterEachFn);

                        case 7:
                            return _context3.abrupt('return', _context3.sent);

                        case 8:
                            return _context3.abrupt('return', true);

                        case 9:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _runAfterHook() {
            return _ref3.apply(this, arguments);
        }

        return _runAfterHook;
    }();

    TestRun.prototype.start = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _testRunTracker2.default.activeTestRuns[this.session.id] = this;

                            this.emit('start');

                            _context4.next = 4;
                            return this._runBeforeHook();

                        case 4:
                            if (!_context4.sent) {
                                _context4.next = 9;
                                break;
                            }

                            _context4.next = 7;
                            return this._executeTestFn(_phase2.default.inTest, this.test.fn);

                        case 7:
                            _context4.next = 9;
                            return this._runAfterHook();

                        case 9:
                            if (!(this.errs.length && this.debugOnFail)) {
                                _context4.next = 12;
                                break;
                            }

                            _context4.next = 12;
                            return this._enqueueSetBreakpointCommand(null, this.debugReporterPluginHost.formatError(this.errs[0]));

                        case 12:
                            _context4.next = 14;
                            return this.executeCommand(new _service.TestDoneCommand());

                        case 14:
                            this._addPendingPageErrorIfAny();

                            delete _testRunTracker2.default.activeTestRuns[this.session.id];

                            this.emit('done');

                        case 17:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function start() {
            return _ref4.apply(this, arguments);
        }

        return start;
    }();

    TestRun.prototype._evaluate = function _evaluate(code) {
        try {
            return (0, _executeJsExpression.executeJsExpression)(code, false, this);
        } catch (err) {
            return { err: err };
        }
    };

    // Errors


    TestRun.prototype._addPendingPageErrorIfAny = function _addPendingPageErrorIfAny() {
        if (this.pendingPageError) {
            this.addError(this.pendingPageError);
            this.pendingPageError = null;
            return true;
        }

        return false;
    };

    TestRun.prototype.addError = function addError(err, screenshotPath) {
        var _this5 = this;

        var errList = err instanceof _errorList2.default ? err.items : [err];

        errList.forEach(function (item) {
            var adapter = new _formattableAdapter2.default(item, {
                userAgent: _this5.browserConnection.userAgent,
                screenshotPath: screenshotPath || '',
                testRunPhase: _this5.phase
            });

            _this5.errs.push(adapter);
        });
    };

    // Task queue


    TestRun.prototype._enqueueCommand = function _enqueueCommand(command, callsite) {
        var _this6 = this;

        if (this.pendingRequest) this._resolvePendingRequest(command);

        return new _pinkie2.default(function (resolve, reject) {
            _this6.addingDriverTasksCount--;
            _this6.driverTaskQueue.push({ command: command, resolve: resolve, reject: reject, callsite: callsite });

            if (!_this6.addingDriverTasksCount) _this6.emit(ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT, _this6.driverTaskQueue.length);
        });
    };

    TestRun.prototype._enqueueBrowserConsoleMessagesCommand = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(command, callsite) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return this._enqueueCommand(command, callsite);

                        case 2:
                            return _context5.abrupt('return', this.consoleMessages.getCopy());

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function _enqueueBrowserConsoleMessagesCommand(_x3, _x4) {
            return _ref5.apply(this, arguments);
        }

        return _enqueueBrowserConsoleMessagesCommand;
    }();

    TestRun.prototype._enqueueSetBreakpointCommand = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(callsite, error) {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _debugLogger2.default.showBreakpoint(this.session.id, this.browserConnection.userAgent, callsite, error);

                            _context6.next = 3;
                            return this.executeCommand(new _service.SetBreakpointCommand(!!error), callsite);

                        case 3:
                            this.debugging = _context6.sent;

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function _enqueueSetBreakpointCommand(_x5, _x6) {
            return _ref6.apply(this, arguments);
        }

        return _enqueueSetBreakpointCommand;
    }();

    TestRun.prototype._removeAllNonServiceTasks = function _removeAllNonServiceTasks() {
        this.driverTaskQueue = this.driverTaskQueue.filter(function (driverTask) {
            return (0, _utils.isServiceCommand)(driverTask.command);
        });

        this.browserManipulationQueue.removeAllNonServiceManipulations();
    };

    // Current driver task


    TestRun.prototype._resolveCurrentDriverTask = function _resolveCurrentDriverTask(result) {
        this.currentDriverTask.resolve(result);
        this.driverTaskQueue.shift();

        if (this.testDoneCommandQueued) this._removeAllNonServiceTasks();
    };

    TestRun.prototype._rejectCurrentDriverTask = function _rejectCurrentDriverTask(err) {
        err.callsite = err.callsite || this.driverTaskQueue[0].callsite;

        this.currentDriverTask.reject(err);
        this._removeAllNonServiceTasks();
    };

    // Pending request


    TestRun.prototype._clearPendingRequest = function _clearPendingRequest() {
        if (this.pendingRequest) {
            clearTimeout(this.pendingRequest.responseTimeout);
            this.pendingRequest = null;
        }
    };

    TestRun.prototype._resolvePendingRequest = function _resolvePendingRequest(command) {
        this.lastDriverStatusResponse = command;
        this.pendingRequest.resolve(command);
        this._clearPendingRequest();
    };

    // Handle driver request


    TestRun.prototype._fulfillCurrentDriverTask = function _fulfillCurrentDriverTask(driverStatus) {
        if (driverStatus.executionError) this._rejectCurrentDriverTask(driverStatus.executionError);else this._resolveCurrentDriverTask(driverStatus.result);
    };

    TestRun.prototype._handlePageErrorStatus = function _handlePageErrorStatus(pageError) {
        if (this.currentDriverTask && (0, _utils.isCommandRejectableByPageError)(this.currentDriverTask.command)) {
            this._rejectCurrentDriverTask(pageError);
            this.pendingPageError = null;

            return true;
        }

        this.pendingPageError = this.pendingPageError || pageError;

        return false;
    };

    TestRun.prototype._handleDriverRequest = function _handleDriverRequest(driverStatus) {
        var pageError = this.pendingPageError || driverStatus.pageError;

        var currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        this.consoleMessages.concat(driverStatus.consoleMessages);

        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (this.currentDriverTask.command.type === _type2.default.testDone) {
                this._resolveCurrentDriverTask();

                return TEST_DONE_CONFIRMATION_RESPONSE;
            }

            this._fulfillCurrentDriverTask(driverStatus);
        }

        return this._getCurrentDriverTaskCommand();
    };

    TestRun.prototype._getCurrentDriverTaskCommand = function _getCurrentDriverTaskCommand() {
        if (!this.currentDriverTask) return null;

        var command = this.currentDriverTask.command;

        if (command.type === _type2.default.navigateTo && command.stateSnapshot) this.session.useStateSnapshot(JSON.parse(command.stateSnapshot));

        return command;
    };

    // Execute command


    TestRun._shouldAddCommandToQueue = function _shouldAddCommandToQueue(command) {
        return command.type !== _type2.default.wait && command.type !== _type2.default.setPageLoadTimeout && command.type !== _type2.default.debug && command.type !== _type2.default.useRole && command.type !== _type2.default.assertion;
    };

    TestRun.prototype._executeAssertion = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(command, callsite) {
            var _this7 = this;

            var assertionTimeout, executor;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            assertionTimeout = command.options.timeout === void 0 ? this.opts.assertionTimeout : command.options.timeout;
                            executor = new _executor2.default(command, assertionTimeout, callsite);


                            executor.once('start-assertion-retries', function (timeout) {
                                return _this7.executeCommand(new _service.ShowAssertionRetriesStatusCommand(timeout));
                            });
                            executor.once('end-assertion-retries', function (success) {
                                return _this7.executeCommand(new _service.HideAssertionRetriesStatusCommand(success));
                            });

                            return _context7.abrupt('return', executor.run());

                        case 5:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function _executeAssertion(_x7, _x8) {
            return _ref7.apply(this, arguments);
        }

        return _executeAssertion;
    }();

    TestRun.prototype._adjustConfigurationWithCommand = function _adjustConfigurationWithCommand(command) {
        if (command.type === _type2.default.testDone) {
            this.testDoneCommandQueued = true;
            _debugLogger2.default.hideBreakpoint(this.session.id);
        } else if (command.type === _type2.default.setNativeDialogHandler) this.activeDialogHandler = command.dialogHandler;else if (command.type === _type2.default.switchToIframe) this.activeIframeSelector = command.selector;else if (command.type === _type2.default.switchToMainWindow) this.activeIframeSelector = null;else if (command.type === _type2.default.setTestSpeed) this.speed = command.speed;else if (command.type === _type2.default.setPageLoadTimeout) this.pageLoadTimeout = command.duration;else if (command.type === _type2.default.debug) this.debugging = true;
    };

    TestRun.prototype._adjustScreenshotCommand = function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(command) {
            var browserId, _ref9, hasChromelessScreenshots;

            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            browserId = this.browserConnection.id;
                            _context8.next = 3;
                            return this.browserConnection.provider.hasCustomActionForBrowser(browserId);

                        case 3:
                            _ref9 = _context8.sent;
                            hasChromelessScreenshots = _ref9.hasChromelessScreenshots;


                            if (!hasChromelessScreenshots) command.generateScreenshotMark();

                        case 6:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function _adjustScreenshotCommand(_x9) {
            return _ref8.apply(this, arguments);
        }

        return _adjustScreenshotCommand;
    }();

    TestRun.prototype._setBreakpointIfNecessary = function () {
        var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(command, callsite) {
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            if (!(!this.disableDebugBreakpoints && this.debugging && (0, _utils.canSetDebuggerBreakpointBeforeCommand)(command))) {
                                _context9.next = 3;
                                break;
                            }

                            _context9.next = 3;
                            return this._enqueueSetBreakpointCommand(callsite);

                        case 3:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function _setBreakpointIfNecessary(_x10, _x11) {
            return _ref10.apply(this, arguments);
        }

        return _setBreakpointIfNecessary;
    }();

    TestRun.prototype.executeCommand = function () {
        var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(command, callsite) {
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            this.debugLog.command(command);

                            if (!(this.pendingPageError && (0, _utils.isCommandRejectableByPageError)(command))) {
                                _context10.next = 3;
                                break;
                            }

                            return _context10.abrupt('return', this._rejectCommandWithPageError(callsite));

                        case 3:

                            if (TestRun._shouldAddCommandToQueue(command)) this.addingDriverTasksCount++;

                            this._adjustConfigurationWithCommand(command);

                            _context10.next = 7;
                            return this._setBreakpointIfNecessary(command, callsite);

                        case 7:
                            if (!(0, _utils.isScreenshotCommand)(command)) {
                                _context10.next = 10;
                                break;
                            }

                            _context10.next = 10;
                            return this._adjustScreenshotCommand(command);

                        case 10:

                            if ((0, _utils.isBrowserManipulationCommand)(command)) this.browserManipulationQueue.push(command);

                            if (!(command.type === _type2.default.wait)) {
                                _context10.next = 13;
                                break;
                            }

                            return _context10.abrupt('return', (0, _delay2.default)(command.timeout));

                        case 13:
                            if (!(command.type === _type2.default.setPageLoadTimeout)) {
                                _context10.next = 15;
                                break;
                            }

                            return _context10.abrupt('return', null);

                        case 15:
                            if (!(command.type === _type2.default.debug)) {
                                _context10.next = 19;
                                break;
                            }

                            _context10.next = 18;
                            return this._enqueueSetBreakpointCommand(callsite);

                        case 18:
                            return _context10.abrupt('return', _context10.sent);

                        case 19:
                            if (!(command.type === _type2.default.useRole)) {
                                _context10.next = 23;
                                break;
                            }

                            _context10.next = 22;
                            return this._useRole(command.role, callsite);

                        case 22:
                            return _context10.abrupt('return', _context10.sent);

                        case 23:
                            if (!(command.type === _type2.default.assertion)) {
                                _context10.next = 25;
                                break;
                            }

                            return _context10.abrupt('return', this._executeAssertion(command, callsite));

                        case 25:
                            if (!(command.type === _type2.default.getBrowserConsoleMessages)) {
                                _context10.next = 29;
                                break;
                            }

                            _context10.next = 28;
                            return this._enqueueBrowserConsoleMessagesCommand(command, callsite);

                        case 28:
                            return _context10.abrupt('return', _context10.sent);

                        case 29:
                            return _context10.abrupt('return', this._enqueueCommand(command, callsite));

                        case 30:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function executeCommand(_x12, _x13) {
            return _ref11.apply(this, arguments);
        }

        return executeCommand;
    }();

    TestRun.prototype._rejectCommandWithPageError = function _rejectCommandWithPageError(callsite) {
        var err = this.pendingPageError;

        err.callsite = callsite;
        this.pendingPageError = null;

        return _pinkie2.default.reject(err);
    };

    // Role management


    TestRun.prototype.getStateSnapshot = function () {
        var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
            var state;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            state = this.session.getStateSnapshot();
                            _context11.next = 3;
                            return this.executeCommand(new _service.BackupStoragesCommand());

                        case 3:
                            state.storages = _context11.sent;
                            return _context11.abrupt('return', state);

                        case 5:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function getStateSnapshot() {
            return _ref12.apply(this, arguments);
        }

        return getStateSnapshot;
    }();

    TestRun.prototype.switchToCleanRun = function () {
        var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
            var removeDialogHandlerCommand, setSpeedCommand, setPageLoadTimeoutCommand;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            this.ctx = (0, _create2.default)(null);
                            this.fixtureCtx = (0, _create2.default)(null);
                            this.consoleMessages = new _browserConsoleMessages2.default();

                            this.session.useStateSnapshot(null);

                            if (!this.activeDialogHandler) {
                                _context12.next = 8;
                                break;
                            }

                            removeDialogHandlerCommand = new _actions.SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });
                            _context12.next = 8;
                            return this.executeCommand(removeDialogHandlerCommand);

                        case 8:
                            if (!(this.speed !== this.opts.speed)) {
                                _context12.next = 12;
                                break;
                            }

                            setSpeedCommand = new _actions.SetTestSpeedCommand({ speed: this.opts.speed });
                            _context12.next = 12;
                            return this.executeCommand(setSpeedCommand);

                        case 12:
                            if (!(this.pageLoadTimeout !== this.opts.pageLoadTimeout)) {
                                _context12.next = 16;
                                break;
                            }

                            setPageLoadTimeoutCommand = new _actions.SetPageLoadTimeoutCommand({ duration: this.opts.pageLoadTimeout });
                            _context12.next = 16;
                            return this.executeCommand(setPageLoadTimeoutCommand);

                        case 16:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        }));

        function switchToCleanRun() {
            return _ref13.apply(this, arguments);
        }

        return switchToCleanRun;
    }();

    TestRun.prototype._getStateSnapshotFromRole = function () {
        var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(role) {
            var prevPhase;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            prevPhase = this.phase;


                            this.phase = _phase2.default.inRoleInitializer;

                            if (!(role.phase === _phase4.default.uninitialized)) {
                                _context13.next = 7;
                                break;
                            }

                            _context13.next = 5;
                            return role.initialize(this);

                        case 5:
                            _context13.next = 10;
                            break;

                        case 7:
                            if (!(role.phase === _phase4.default.pendingInitialization)) {
                                _context13.next = 10;
                                break;
                            }

                            _context13.next = 10;
                            return (0, _promisifyEvent2.default)(role, 'initialized');

                        case 10:
                            if (!role.initErr) {
                                _context13.next = 12;
                                break;
                            }

                            throw role.initErr;

                        case 12:

                            this.phase = prevPhase;

                            return _context13.abrupt('return', role.stateSnapshot);

                        case 14:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this);
        }));

        function _getStateSnapshotFromRole(_x14) {
            return _ref14.apply(this, arguments);
        }

        return _getStateSnapshotFromRole;
    }();

    TestRun.prototype._useRole = function () {
        var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(role, callsite) {
            var bookmark, stateSnapshot;
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            if (!(this.phase === _phase2.default.inRoleInitializer)) {
                                _context14.next = 2;
                                break;
                            }

                            throw new _testRun.RoleSwitchInRoleInitializerError(callsite);

                        case 2:

                            this.disableDebugBreakpoints = true;

                            bookmark = new _bookmark2.default(this, role);
                            _context14.next = 6;
                            return bookmark.init();

                        case 6:
                            if (!this.currentRoleId) {
                                _context14.next = 10;
                                break;
                            }

                            _context14.next = 9;
                            return this.getStateSnapshot();

                        case 9:
                            this.usedRoleStates[this.currentRoleId] = _context14.sent;

                        case 10:
                            _context14.t0 = this.usedRoleStates[role.id];

                            if (_context14.t0) {
                                _context14.next = 15;
                                break;
                            }

                            _context14.next = 14;
                            return this._getStateSnapshotFromRole(role);

                        case 14:
                            _context14.t0 = _context14.sent;

                        case 15:
                            stateSnapshot = _context14.t0;


                            this.session.useStateSnapshot(stateSnapshot);

                            this.currentRoleId = role.id;

                            _context14.next = 20;
                            return bookmark.restore(callsite, stateSnapshot);

                        case 20:

                            this.disableDebugBreakpoints = false;

                        case 21:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this);
        }));

        function _useRole(_x15, _x16) {
            return _ref15.apply(this, arguments);
        }

        return _useRole;
    }();

    // Get current URL


    TestRun.prototype.getCurrentUrl = function () {
        var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
            var builder, getLocation;
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            builder = new _clientFunctionBuilder2.default(function () {
                                /* eslint-disable no-undef */
                                return window.location.href;
                                /* eslint-enable no-undef */
                            }, { boundTestRun: this });
                            getLocation = builder.getFunction();
                            _context15.next = 4;
                            return getLocation();

                        case 4:
                            return _context15.abrupt('return', _context15.sent);

                        case 5:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this);
        }));

        function getCurrentUrl() {
            return _ref16.apply(this, arguments);
        }

        return getCurrentUrl;
    }();

    (0, _createClass3.default)(TestRun, [{
        key: 'id',
        get: function get() {
            return this.session.id;
        }
    }, {
        key: 'injectable',
        get: function get() {
            return this.session.injectable;
        }
    }, {
        key: 'driverTaskQueueLength',
        get: function get() {
            return this.addingDriverTasksCount ? (0, _promisifyEvent2.default)(this, ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT) : _pinkie2.default.resolve(this.driverTaskQueue.length);
        }
    }, {
        key: 'currentDriverTask',
        get: function get() {
            return this.driverTaskQueue[0];
        }
    }]);
    return TestRun;
}(_events2.default);

// Service message handlers


exports.default = TestRun;
var ServiceMessages = TestRun.prototype;

ServiceMessages[_clientMessages2.default.ready] = function (msg) {
    var _this8 = this;

    this.debugLog.driverMessage(msg);

    this._clearPendingRequest();

    // NOTE: the driver sends the status for the second time if it didn't get a response at the
    // first try. This is possible when the page was unloaded after the driver sent the status.
    if (msg.status.id === this.lastDriverStatusId) return this.lastDriverStatusResponse;

    this.lastDriverStatusId = msg.status.id;
    this.lastDriverStatusResponse = this._handleDriverRequest(msg.status);

    if (this.lastDriverStatusResponse) return this.lastDriverStatusResponse;

    // NOTE: browsers abort an opened xhr request after a certain timeout (the actual duration depends on the browser).
    // To avoid this, we send an empty response after 2 minutes if we didn't get any command.
    var responseTimeout = setTimeout(function () {
        return _this8._resolvePendingRequest(null);
    }, MAX_RESPONSE_DELAY);

    return new _pinkie2.default(function (resolve, reject) {
        _this8.pendingRequest = { resolve: resolve, reject: reject, responseTimeout: responseTimeout };
    });
};

ServiceMessages[_clientMessages2.default.readyForBrowserManipulation] = function () {
    var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(msg) {
        var result, error;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        this.debugLog.driverMessage(msg);

                        result = null;
                        error = null;
                        _context16.prev = 3;
                        _context16.next = 6;
                        return this.browserManipulationQueue.executePendingManipulation(msg);

                    case 6:
                        result = _context16.sent;
                        _context16.next = 12;
                        break;

                    case 9:
                        _context16.prev = 9;
                        _context16.t0 = _context16['catch'](3);

                        error = _context16.t0;

                    case 12:
                        return _context16.abrupt('return', { result: result, error: error });

                    case 13:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this, [[3, 9]]);
    }));

    return function (_x17) {
        return _ref17.apply(this, arguments);
    };
}();

ServiceMessages[_clientMessages2.default.waitForFileDownload] = function (msg) {
    var _this9 = this;

    this.debugLog.driverMessage(msg);

    return new _pinkie2.default(function (resolve) {
        if (_this9.fileDownloadingHandled) {
            _this9.fileDownloadingHandled = false;
            resolve(true);
        } else _this9.resolveWaitForFileDownloadingPromise = resolve;
    });
};
module.exports = exports['default'];