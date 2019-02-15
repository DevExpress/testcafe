import { pull as remove } from 'lodash';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import Promise from 'pinkie';
import Mustache from 'mustache';
import AsyncEventEmitter from '../utils/async-event-emitter';
import debugLogger from '../notifications/debug-logger';
import TestRunDebugLog from './debug-log';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import TestCafeErrorList from '../errors/error-list';
import { PageLoadError, RoleSwitchInRoleInitializerError } from '../errors/test-run/';
import PHASE from './phase';
import CLIENT_MESSAGES from './client-messages';
import COMMAND_TYPE from './commands/type';
import delay from '../utils/delay';
import testRunMarker from './marker-symbol';
import testRunTracker from '../api/test-run-tracker';
import ROLE_PHASE from '../role/phase';
import ReporterPluginHost from '../reporter/plugin-host';
import BrowserConsoleMessages from './browser-console-messages';
import { UNSTABLE_NETWORK_MODE_HEADER } from '../browser/connection/unstable-network-mode';
import WarningLog from '../notifications/warning-log';
import WARNING_MESSAGE from '../notifications/warning-message';

import {
    isCommandRejectableByPageError,
    isBrowserManipulationCommand,
    isScreenshotCommand,
    isServiceCommand,
    canSetDebuggerBreakpointBeforeCommand,
    isExecutableOnClientCommand
} from './commands/utils';

const lazyRequire                 = require('import-lazy')(require);
const SessionController           = lazyRequire('./session-controller');
const ClientFunctionBuilder       = lazyRequire('../client-functions/client-function-builder');
const executeJsExpression         = lazyRequire('./execute-js-expression');
const BrowserManipulationQueue    = lazyRequire('./browser-manipulation-queue');
const TestRunBookmark             = lazyRequire('./bookmark');
const AssertionExecutor           = lazyRequire('../assertions/executor');
const actionCommands              = lazyRequire('./commands/actions');
const browserManipulationCommands = lazyRequire('./commands/browser-manipulation');
const serviceCommands             = lazyRequire('./commands/service');


const TEST_RUN_TEMPLATE               = read('../client/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE        = read('../client/test-run/iframe.js.mustache');
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY              = 3000;

const ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT = 'all-driver-tasks-added-to-queue';

export default class TestRun extends AsyncEventEmitter {
    constructor (test, browserConnection, screenshotCapturer, globalWarningLog, opts) {
        super();

        this[testRunMarker] = true;

        this.warningLog = new WarningLog(globalWarningLog);

        this.opts              = opts;
        this.test              = test;
        this.browserConnection = browserConnection;

        this.phase = PHASE.initial;

        this.driverTaskQueue       = [];
        this.testDoneCommandQueued = false;

        this.activeDialogHandler  = null;
        this.activeIframeSelector = null;
        this.speed                = this.opts.speed;
        this.pageLoadTimeout      = this.opts.pageLoadTimeout;

        this.disablePageReloads = test.disablePageReloads || opts.disablePageReloads && test.disablePageReloads !== false;

        this.session = SessionController.getSession(this);

        this.consoleMessages = new BrowserConsoleMessages();

        this.pendingRequest   = null;
        this.pendingPageError = null;

        this.controller = null;
        this.ctx        = Object.create(null);
        this.fixtureCtx = null;

        this.currentRoleId  = null;
        this.usedRoleStates = Object.create(null);

        this.errs = [];

        this.lastDriverStatusId       = null;
        this.lastDriverStatusResponse = null;

        this.fileDownloadingHandled               = false;
        this.resolveWaitForFileDownloadingPromise = null;

        this.addingDriverTasksCount = 0;

        this.debugging               = this.opts.debugMode;
        this.debugOnFail             = this.opts.debugOnFail;
        this.disableDebugBreakpoints = false;
        this.debugReporterPluginHost = new ReporterPluginHost({ noColors: false });

        this.browserManipulationQueue = new BrowserManipulationQueue(browserConnection, screenshotCapturer, this.warningLog);

        this.debugLog = new TestRunDebugLog(this.browserConnection.userAgent);

        this.quarantine = null;

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-automation.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');

        this.requestHooks = Array.from(this.test.requestHooks);

        this._initRequestHooks();
    }

    get id () {
        return this.session.id;
    }

    get injectable () {
        return this.session.injectable;
    }

    addQuarantineInfo (quarantine) {
        this.quarantine = quarantine;
    }

    addRequestHook (hook) {
        if (this.requestHooks.indexOf(hook) !== -1)
            return;

        this.requestHooks.push(hook);
        this._initRequestHook(hook);
    }

    removeRequestHook (hook) {
        if (this.requestHooks.indexOf(hook) === -1)
            return;

        remove(this.requestHooks, hook);
        this._disposeRequestHook(hook);
    }

    _initRequestHook (hook) {
        hook.warningLog = this.warningLog;

        hook._instantiateRequestFilterRules();
        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.session.addRequestEventListeners(rule, {
                onRequest:           hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse:          hook.onResponse.bind(hook)
            });
        });
    }

    _disposeRequestHook (hook) {
        hook.warningLog = null;

        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.session.removeRequestEventListeners(rule);
        });
    }

    _initRequestHooks () {
        this.requestHooks.forEach(hook => this._initRequestHook(hook));
    }

    // Hammerhead payload
    _getPayloadScript () {
        this.fileDownloadingHandled               = false;
        this.resolveWaitForFileDownloadingPromise = null;

        return Mustache.render(TEST_RUN_TEMPLATE, {
            testRunId:                    JSON.stringify(this.session.id),
            browserId:                    JSON.stringify(this.browserConnection.id),
            browserHeartbeatRelativeUrl:  JSON.stringify(this.browserConnection.heartbeatRelativeUrl),
            browserStatusRelativeUrl:     JSON.stringify(this.browserConnection.statusRelativeUrl),
            browserStatusDoneRelativeUrl: JSON.stringify(this.browserConnection.statusDoneRelativeUrl),
            userAgent:                    JSON.stringify(this.browserConnection.userAgent),
            testName:                     JSON.stringify(this.test.name),
            fixtureName:                  JSON.stringify(this.test.fixture.name),
            selectorTimeout:              this.opts.selectorTimeout,
            pageLoadTimeout:              this.pageLoadTimeout,
            skipJsErrors:                 this.opts.skipJsErrors,
            retryTestPages:               !!this.opts.retryTestPages,
            speed:                        this.speed,
            dialogHandler:                JSON.stringify(this.activeDialogHandler)
        });
    }

    _getIframePayloadScript () {
        return Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId:       JSON.stringify(this.session.id),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            retryTestPages:  !!this.opts.retryTestPages,
            speed:           this.speed,
            dialogHandler:   JSON.stringify(this.activeDialogHandler)
        });
    }

    // Hammerhead handlers
    getAuthCredentials () {
        return this.test.authCredentials;
    }

    handleFileDownload () {
        if (this.resolveWaitForFileDownloadingPromise) {
            this.resolveWaitForFileDownloadingPromise(true);
            this.resolveWaitForFileDownloadingPromise = null;
        }
        else
            this.fileDownloadingHandled = true;
    }

    handlePageError (ctx, err) {
        if (ctx.req.headers[UNSTABLE_NETWORK_MODE_HEADER]) {
            ctx.closeWithError(500, err.toString());
            return;
        }

        this.pendingPageError = new PageLoadError(err);

        ctx.redirect(ctx.toProxyUrl('about:error'));
    }

    // Test function execution
    async _executeTestFn (phase, fn) {
        this.phase = phase;

        try {
            await fn(this);
        }
        catch (err) {
            let screenshotPath = null;

            if (this.opts.takeScreenshotsOnFails)
                screenshotPath = await this.executeCommand(new browserManipulationCommands.TakeScreenshotOnFailCommand());

            this.addError(err, screenshotPath);
            return false;
        }

        return !this._addPendingPageErrorIfAny();
    }

    async _runBeforeHook () {
        if (this.test.beforeFn)
            return await this._executeTestFn(PHASE.inTestBeforeHook, this.test.beforeFn);

        if (this.test.fixture.beforeEachFn)
            return await this._executeTestFn(PHASE.inFixtureBeforeEachHook, this.test.fixture.beforeEachFn);

        return true;
    }

    async _runAfterHook () {
        if (this.test.afterFn)
            return await this._executeTestFn(PHASE.inTestAfterHook, this.test.afterFn);

        if (this.test.fixture.afterEachFn)
            return await this._executeTestFn(PHASE.inFixtureAfterEachHook, this.test.fixture.afterEachFn);

        return true;
    }

    async start () {
        testRunTracker.activeTestRuns[this.session.id] = this;

        await this.emit('start');

        const onDisconnected = err => this._disconnect(err);

        this.browserConnection.once('disconnected', onDisconnected);

        await this.once('connected');

        await this.emit('ready');

        if (await this._runBeforeHook()) {
            await this._executeTestFn(PHASE.inTest, this.test.fn);
            await this._runAfterHook();
        }

        if (this.disconnected)
            return;

        this.browserConnection.removeListener('disconnected', onDisconnected);

        if (this.errs.length && this.debugOnFail)
            await this._enqueueSetBreakpointCommand(null, this.debugReporterPluginHost.formatError(this.errs[0]));

        await this.emit('before-done');

        await this.executeCommand(new serviceCommands.TestDoneCommand());

        this._addPendingPageErrorIfAny();

        delete testRunTracker.activeTestRuns[this.session.id];

        await this.emit('done');
    }

    _evaluate (code) {
        try {
            return executeJsExpression(code, this, { skipVisibilityCheck: false });
        }
        catch (err) {
            return { err };
        }
    }

    // Errors
    _addPendingPageErrorIfAny () {
        if (this.pendingPageError) {
            this.addError(this.pendingPageError);
            this.pendingPageError = null;
            return true;
        }

        return false;
    }

    addError (err, screenshotPath) {
        const errList = err instanceof TestCafeErrorList ? err.items : [err];

        errList.forEach(item => {
            const adapter = new TestRunErrorFormattableAdapter(item, {
                userAgent:      this.browserConnection.userAgent,
                screenshotPath: screenshotPath || '',
                testRunPhase:   this.phase
            });

            this.errs.push(adapter);
        });
    }

    // Task queue
    _enqueueCommand (command, callsite) {
        if (this.pendingRequest)
            this._resolvePendingRequest(command);

        return new Promise(async (resolve, reject) => {
            this.addingDriverTasksCount--;
            this.driverTaskQueue.push({ command, resolve, reject, callsite });

            if (!this.addingDriverTasksCount)
                await this.emit(ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT, this.driverTaskQueue.length);
        });
    }

    get driverTaskQueueLength () {
        return this.addingDriverTasksCount ? promisifyEvent(this, ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT) : Promise.resolve(this.driverTaskQueue.length);
    }

    async _enqueueBrowserConsoleMessagesCommand (command, callsite) {
        await this._enqueueCommand(command, callsite);

        return this.consoleMessages.getCopy();
    }

    async _enqueueSetBreakpointCommand (callsite, error) {
        if (this.browserConnection.isHeadlessBrowser()) {
            this.warningLog.addWarning(WARNING_MESSAGE.debugInHeadlessError);
            return;
        }

        debugLogger.showBreakpoint(this.session.id, this.browserConnection.userAgent, callsite, error);

        this.debugging = await this.executeCommand(new serviceCommands.SetBreakpointCommand(!!error), callsite);
    }

    _removeAllNonServiceTasks () {
        this.driverTaskQueue = this.driverTaskQueue.filter(driverTask => isServiceCommand(driverTask.command));

        this.browserManipulationQueue.removeAllNonServiceManipulations();
    }

    // Current driver task
    get currentDriverTask () {
        return this.driverTaskQueue[0];
    }

    _resolveCurrentDriverTask (result) {
        this.currentDriverTask.resolve(result);
        this.driverTaskQueue.shift();

        if (this.testDoneCommandQueued)
            this._removeAllNonServiceTasks();
    }

    _rejectCurrentDriverTask (err) {
        err.callsite             = err.callsite || this.currentDriverTask.callsite;
        err.isRejectedDriverTask = true;

        this.currentDriverTask.reject(err);
        this._removeAllNonServiceTasks();
    }

    // Pending request
    _clearPendingRequest () {
        if (this.pendingRequest) {
            clearTimeout(this.pendingRequest.responseTimeout);
            this.pendingRequest = null;
        }
    }

    _resolvePendingRequest (command) {
        this.lastDriverStatusResponse = command;
        this.pendingRequest.resolve(command);
        this._clearPendingRequest();
    }

    // Handle driver request
    _fulfillCurrentDriverTask (driverStatus) {
        if (driverStatus.executionError)
            this._rejectCurrentDriverTask(driverStatus.executionError);
        else
            this._resolveCurrentDriverTask(driverStatus.result);
    }

    _handlePageErrorStatus (pageError) {
        if (this.currentDriverTask && isCommandRejectableByPageError(this.currentDriverTask.command)) {
            this._rejectCurrentDriverTask(pageError);
            this.pendingPageError = null;

            return true;
        }

        this.pendingPageError = this.pendingPageError || pageError;

        return false;
    }

    _handleDriverRequest (driverStatus) {
        const isTestDone                 = this.currentDriverTask && this.currentDriverTask.command.type === COMMAND_TYPE.testDone;
        const pageError                  = this.pendingPageError || driverStatus.pageError;
        const currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        if (this.disconnected)
            return new Promise((_, reject) => reject());

        this.consoleMessages.concat(driverStatus.consoleMessages);

        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (isTestDone) {
                this._resolveCurrentDriverTask();

                return TEST_DONE_CONFIRMATION_RESPONSE;
            }

            this._fulfillCurrentDriverTask(driverStatus);
        }

        return this._getCurrentDriverTaskCommand();
    }

    _getCurrentDriverTaskCommand () {
        if (!this.currentDriverTask)
            return null;

        const command = this.currentDriverTask.command;

        if (command.type === COMMAND_TYPE.navigateTo && command.stateSnapshot)
            this.session.useStateSnapshot(JSON.parse(command.stateSnapshot));

        return command;
    }

    // Execute command
    async _executeExpression (command) {
        const { resultVariableName, isAsyncExpression } = command;

        let expression = command.expression;

        if (isAsyncExpression)
            expression = `await ${expression}`;

        if (resultVariableName)
            expression = `${resultVariableName} = ${expression}, ${resultVariableName}`;

        if (isAsyncExpression)
            expression = `(async () => { return ${expression}; }).apply(this);`;

        const result = this._evaluate(expression);

        return isAsyncExpression ? await result : result;
    }

    async _executeAssertion (command, callsite) {
        const assertionTimeout = command.options.timeout === void 0 ? this.opts.assertionTimeout : command.options.timeout;
        const executor         = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', success => this.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success)));

        return executor.run();
    }

    _adjustConfigurationWithCommand (command) {
        if (command.type === COMMAND_TYPE.testDone) {
            this.testDoneCommandQueued = true;
            debugLogger.hideBreakpoint(this.session.id);
        }

        else if (command.type === COMMAND_TYPE.setNativeDialogHandler)
            this.activeDialogHandler = command.dialogHandler;

        else if (command.type === COMMAND_TYPE.switchToIframe)
            this.activeIframeSelector = command.selector;

        else if (command.type === COMMAND_TYPE.switchToMainWindow)
            this.activeIframeSelector = null;

        else if (command.type === COMMAND_TYPE.setTestSpeed)
            this.speed = command.speed;

        else if (command.type === COMMAND_TYPE.setPageLoadTimeout)
            this.pageLoadTimeout = command.duration;

        else if (command.type === COMMAND_TYPE.debug)
            this.debugging = true;
    }

    async _adjustScreenshotCommand (command) {
        const browserId                    = this.browserConnection.id;
        const { hasChromelessScreenshots } = await this.browserConnection.provider.hasCustomActionForBrowser(browserId);

        if (!hasChromelessScreenshots)
            command.generateScreenshotMark();
    }

    async _setBreakpointIfNecessary (command, callsite) {
        if (!this.disableDebugBreakpoints && this.debugging && canSetDebuggerBreakpointBeforeCommand(command))
            await this._enqueueSetBreakpointCommand(callsite);
    }

    async executeCommand (command, callsite) {
        this.debugLog.command(command);

        if (this.pendingPageError && isCommandRejectableByPageError(command))
            return this._rejectCommandWithPageError(callsite);

        if (isExecutableOnClientCommand(command))
            this.addingDriverTasksCount++;

        this._adjustConfigurationWithCommand(command);

        await this._setBreakpointIfNecessary(command, callsite);

        if (isScreenshotCommand(command))
            await this._adjustScreenshotCommand(command);

        if (isBrowserManipulationCommand(command))
            this.browserManipulationQueue.push(command);

        if (command.type === COMMAND_TYPE.wait)
            return delay(command.timeout);

        if (command.type === COMMAND_TYPE.setPageLoadTimeout)
            return null;

        if (command.type === COMMAND_TYPE.debug)
            return await this._enqueueSetBreakpointCommand(callsite);

        if (command.type === COMMAND_TYPE.useRole)
            return await this._useRole(command.role, callsite);

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command, callsite);

        if (command.type === COMMAND_TYPE.executeExpression)
            return await this._executeExpression(command, callsite);

        if (command.type === COMMAND_TYPE.getBrowserConsoleMessages)
            return await this._enqueueBrowserConsoleMessagesCommand(command, callsite);

        return this._enqueueCommand(command, callsite);
    }

    _rejectCommandWithPageError (callsite) {
        const err = this.pendingPageError;

        err.callsite          = callsite;
        this.pendingPageError = null;

        return Promise.reject(err);
    }

    // Role management
    async getStateSnapshot () {
        const state = this.session.getStateSnapshot();

        state.storages = await this.executeCommand(new serviceCommands.BackupStoragesCommand());

        return state;
    }

    async switchToCleanRun () {
        this.ctx             = Object.create(null);
        this.fixtureCtx      = Object.create(null);
        this.consoleMessages = new BrowserConsoleMessages();

        this.session.useStateSnapshot(null);

        if (this.activeDialogHandler) {
            const removeDialogHandlerCommand = new actionCommands.SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });

            await this.executeCommand(removeDialogHandlerCommand);
        }

        if (this.speed !== this.opts.speed) {
            const setSpeedCommand = new actionCommands.SetTestSpeedCommand({ speed: this.opts.speed });

            await this.executeCommand(setSpeedCommand);
        }

        if (this.pageLoadTimeout !== this.opts.pageLoadTimeout) {
            const setPageLoadTimeoutCommand = new actionCommands.SetPageLoadTimeoutCommand({ duration: this.opts.pageLoadTimeout });

            await this.executeCommand(setPageLoadTimeoutCommand);
        }
    }

    async _getStateSnapshotFromRole (role) {
        const prevPhase = this.phase;

        this.phase = PHASE.inRoleInitializer;

        if (role.phase === ROLE_PHASE.uninitialized)
            await role.initialize(this);

        else if (role.phase === ROLE_PHASE.pendingInitialization)
            await promisifyEvent(role, 'initialized');

        if (role.initErr)
            throw role.initErr;

        this.phase = prevPhase;

        return role.stateSnapshot;
    }

    async _useRole (role, callsite) {
        if (this.phase === PHASE.inRoleInitializer)
            throw new RoleSwitchInRoleInitializerError(callsite);

        this.disableDebugBreakpoints = true;

        const bookmark = new TestRunBookmark(this, role);

        await bookmark.init();

        if (this.currentRoleId)
            this.usedRoleStates[this.currentRoleId] = await this.getStateSnapshot();

        const stateSnapshot = this.usedRoleStates[role.id] || await this._getStateSnapshotFromRole(role);

        this.session.useStateSnapshot(stateSnapshot);

        this.currentRoleId = role.id;

        await bookmark.restore(callsite, stateSnapshot);

        this.disableDebugBreakpoints = false;
    }

    // Get current URL
    async getCurrentUrl () {
        const builder = new ClientFunctionBuilder(() => {
            /* eslint-disable no-undef */
            return window.location.href;
            /* eslint-enable no-undef */
        }, { boundTestRun: this });

        const getLocation = builder.getFunction();

        return await getLocation();
    }

    _disconnect (err) {
        this.disconnected = true;

        this._rejectCurrentDriverTask(err);

        this.emit('disconnected', err);

        delete testRunTracker.activeTestRuns[this.session.id];
    }
}

// Service message handlers
const ServiceMessages = TestRun.prototype;

// NOTE: this function is time-critical and must return ASAP to avoid client disconnection
ServiceMessages[CLIENT_MESSAGES.ready] = function (msg) {
    this.debugLog.driverMessage(msg);

    this.emit('connected');

    this._clearPendingRequest();

    // NOTE: the driver sends the status for the second time if it didn't get a response at the
    // first try. This is possible when the page was unloaded after the driver sent the status.
    if (msg.status.id === this.lastDriverStatusId)
        return this.lastDriverStatusResponse;

    this.lastDriverStatusId       = msg.status.id;
    this.lastDriverStatusResponse = this._handleDriverRequest(msg.status);

    if (this.lastDriverStatusResponse)
        return this.lastDriverStatusResponse;

    // NOTE: we send an empty response after the MAX_RESPONSE_DELAY timeout is exceeded to keep connection
    // with the client and prevent the response timeout exception on the client side
    const responseTimeout = setTimeout(() => this._resolvePendingRequest(null), MAX_RESPONSE_DELAY);

    return new Promise((resolve, reject) => {
        this.pendingRequest = { resolve, reject, responseTimeout };
    });
};

ServiceMessages[CLIENT_MESSAGES.readyForBrowserManipulation] = async function (msg) {
    this.debugLog.driverMessage(msg);

    let result = null;
    let error  = null;

    try {
        result = await this.browserManipulationQueue.executePendingManipulation(msg);
    }
    catch (err) {
        error = err;
    }

    return { result, error };
};

ServiceMessages[CLIENT_MESSAGES.waitForFileDownload] = function (msg) {
    this.debugLog.driverMessage(msg);

    return new Promise(resolve => {
        if (this.fileDownloadingHandled) {
            this.fileDownloadingHandled = false;
            resolve(true);
        }
        else
            this.resolveWaitForFileDownloadingPromise = resolve;
    });
};
