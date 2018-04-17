import path from 'path';
import { pull as remove } from 'lodash';
import { readSync as read } from 'read-file-relative';
import promisifyEvent from 'promisify-event';
import Promise from 'pinkie';
import Mustache from 'mustache';
import debugLogger from '../notifications/debug-logger';
import { Session } from 'testcafe-hammerhead';
import TestRunDebugLog from './debug-log';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import TestCafeErrorList from '../errors/error-list';
import { executeJsExpression } from './execute-js-expression';
import { PageLoadError, RoleSwitchInRoleInitializerError } from '../errors/test-run/';
import BrowserManipulationQueue from './browser-manipulation-queue';
import CLIENT_MESSAGES from './client-messages';
import PHASE from './phase';
import COMMAND_TYPE from './commands/type';
import AssertionExecutor from '../assertions/executor';
import delay from '../utils/delay';
import testRunMarker from './marker-symbol';
import testRunTracker from '../api/test-run-tracker';
import ROLE_PHASE from '../role/phase';
import TestRunBookmark from './bookmark';
import ClientFunctionBuilder from '../client-functions/client-function-builder';
import ReporterPluginHost from '../reporter/plugin-host';
import BrowserConsoleMessages from './browser-console-messages';

import { TakeScreenshotOnFailCommand } from './commands/browser-manipulation';
import { SetNativeDialogHandlerCommand, SetTestSpeedCommand, SetPageLoadTimeoutCommand } from './commands/actions';


import {
    TestDoneCommand,
    ShowAssertionRetriesStatusCommand,
    HideAssertionRetriesStatusCommand,
    SetBreakpointCommand,
    BackupStoragesCommand
} from './commands/service';

import {
    isCommandRejectableByPageError,
    isBrowserManipulationCommand,
    isServiceCommand,
    canSetDebuggerBreakpointBeforeCommand
} from './commands/utils';

//Const
const TEST_RUN_TEMPLATE               = read('../client/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE        = read('../client/test-run/iframe.js.mustache');
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY              = 2 * 60 * 1000;


export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, warningLog, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this[testRunMarker] = true;

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

        this.debugging               = this.opts.debugMode;
        this.debugOnFail             = this.opts.debugOnFail;
        this.disableDebugBreakpoints = false;
        this.debugReporterPluginHost = new ReporterPluginHost({ noColors: false });

        this.browserManipulationQueue = new BrowserManipulationQueue(browserConnection, screenshotCapturer, warningLog);

        this.debugLog = new TestRunDebugLog(this.browserConnection.userAgent);

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-automation.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');

        this.requestHooks = Array.from(this.test.requestHooks);

        this._initRequestHooks();
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
        hook._instantiateRequestFilterRules();
        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.addRequestEventListeners(rule, {
                onRequest:           hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse:          hook.onResponse.bind(hook)
            });
        });
    }

    _disposeRequestHook (hook) {
        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.removeRequestEventListeners(rule);
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
            testRunId:                    JSON.stringify(this.id),
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
            speed:                        this.speed,
            dialogHandler:                JSON.stringify(this.activeDialogHandler)
        });
    }

    _getIframePayloadScript () {
        return Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId:       JSON.stringify(this.id),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
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
            var screenshotPath = null;

            if (this.opts.takeScreenshotsOnFails)
                screenshotPath = await this.executeCommand(new TakeScreenshotOnFailCommand());

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
        testRunTracker.activeTestRuns[this.id] = this;

        this.emit('start');

        if (await this._runBeforeHook()) {
            await this._executeTestFn(PHASE.inTest, this.test.fn);
            await this._runAfterHook();
        }

        if (this.errs.length && this.debugOnFail)
            await this._enqueueSetBreakpointCommand(null, this.debugReporterPluginHost.formatError(this.errs[0]));

        await this.executeCommand(new TestDoneCommand());
        this._addPendingPageErrorIfAny();

        delete testRunTracker.activeTestRuns[this.id];

        this.emit('done');
    }

    _evaluate (code) {
        try {
            return executeJsExpression(code, false, this);
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
        var errList = err instanceof TestCafeErrorList ? err.items : [err];

        errList.forEach(item => {
            var adapter = new TestRunErrorFormattableAdapter(item, {
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

        return new Promise((resolve, reject) => this.driverTaskQueue.push({ command, resolve, reject, callsite }));
    }

    async _enqueueBrowserConsoleMessagesCommand (command, callsite) {
        await this._enqueueCommand(command, callsite);

        return this.consoleMessages.getCopy();
    }

    async _enqueueSetBreakpointCommand (callsite, error) {
        debugLogger.showBreakpoint(this.id, this.browserConnection.userAgent, callsite, error);

        this.debugging = await this._enqueueCommand(new SetBreakpointCommand(!!error), callsite);
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
        err.callsite = err.callsite || this.driverTaskQueue[0].callsite;

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
        var pageError = this.pendingPageError || driverStatus.pageError;

        var currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        this.consoleMessages.concat(driverStatus.consoleMessages);

        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (this.currentDriverTask.command.type === COMMAND_TYPE.testDone) {
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
            this.useStateSnapshot(JSON.parse(command.stateSnapshot));

        return command;
    }

    // Execute command
    async _executeAssertion (command, callsite) {
        var assertionTimeout = command.options.timeout === void 0 ? this.opts.assertionTimeout : command.options.timeout;
        var executor         = new AssertionExecutor(command, assertionTimeout, callsite);

        executor.once('start-assertion-retries', timeout => this._enqueueCommand(new ShowAssertionRetriesStatusCommand(timeout)));
        executor.once('end-assertion-retries', success => this._enqueueCommand(new HideAssertionRetriesStatusCommand(success)));

        return executor.run();
    }

    _adjustConfigurationWithCommand (command) {
        if (command.type === COMMAND_TYPE.testDone) {
            this.testDoneCommandQueued = true;
            debugLogger.hideBreakpoint(this.id);
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


    async _setBreakpointIfNecessary (command, callsite) {
        if (!this.disableDebugBreakpoints && this.debugging && canSetDebuggerBreakpointBeforeCommand(command))
            await this._enqueueSetBreakpointCommand(callsite);
    }

    async executeCommand (command, callsite) {
        this.debugLog.command(command);

        if (this.pendingPageError && isCommandRejectableByPageError(command))
            return this._rejectCommandWithPageError(callsite);

        this._adjustConfigurationWithCommand(command);

        await this._setBreakpointIfNecessary(command, callsite);

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

        if (command.type === COMMAND_TYPE.getBrowserConsoleMessages)
            return await this._enqueueBrowserConsoleMessagesCommand(command, callsite);

        return this._enqueueCommand(command, callsite);
    }

    _rejectCommandWithPageError (callsite) {
        var err = this.pendingPageError;

        err.callsite          = callsite;
        this.pendingPageError = null;

        return Promise.reject(err);
    }

    // Role management
    async getStateSnapshot () {
        var state = super.getStateSnapshot();

        state.storages = await this.executeCommand(new BackupStoragesCommand());

        return state;
    }

    async switchToCleanRun () {
        this.ctx             = Object.create(null);
        this.fixtureCtx      = Object.create(null);
        this.consoleMessages = new BrowserConsoleMessages();

        this.useStateSnapshot(null);

        if (this.activeDialogHandler) {
            var removeDialogHandlerCommand = new SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });

            await this.executeCommand(removeDialogHandlerCommand);
        }

        if (this.speed !== this.opts.speed) {
            var setSpeedCommand = new SetTestSpeedCommand({ speed: this.opts.speed });

            await this.executeCommand(setSpeedCommand);
        }

        if (this.pageLoadTimeout !== this.opts.pageLoadTimeout) {
            var setPageLoadTimeoutCommand = new SetPageLoadTimeoutCommand({ duration: this.opts.pageLoadTimeout });

            await this.executeCommand(setPageLoadTimeoutCommand);
        }
    }

    async _getStateSnapshotFromRole (role) {
        var prevPhase = this.phase;

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

        var bookmark = new TestRunBookmark(this, role);

        await bookmark.init();

        if (this.currentRoleId)
            this.usedRoleStates[this.currentRoleId] = await this.getStateSnapshot();

        var stateSnapshot = this.usedRoleStates[role.id] || await this._getStateSnapshotFromRole(role);

        this.useStateSnapshot(stateSnapshot);

        this.currentRoleId = role.id;

        await bookmark.restore(callsite, stateSnapshot);

        this.disableDebugBreakpoints = false;
    }


    // Get current URL
    async getCurrentUrl () {
        var builder = new ClientFunctionBuilder(() => {
            /* eslint-disable no-undef */
            return window.location.href;
            /* eslint-enable no-undef */
        }, { boundTestRun: this });

        var getLocation = builder.getFunction();

        return await getLocation();
    }
}


// Service message handlers
var ServiceMessages = TestRun.prototype;

ServiceMessages[CLIENT_MESSAGES.ready] = function (msg) {
    this.debugLog.driverMessage(msg);

    this._clearPendingRequest();

    // NOTE: the driver sends the status for the second time if it didn't get a response at the
    // first try. This is possible when the page was unloaded after the driver sent the status.
    if (msg.status.id === this.lastDriverStatusId)
        return this.lastDriverStatusResponse;

    this.lastDriverStatusId       = msg.status.id;
    this.lastDriverStatusResponse = this._handleDriverRequest(msg.status);

    if (this.lastDriverStatusResponse)
        return this.lastDriverStatusResponse;

    // NOTE: browsers abort an opened xhr request after a certain timeout (the actual duration depends on the browser).
    // To avoid this, we send an empty response after 2 minutes if we didn't get any command.
    var responseTimeout = setTimeout(() => this._resolvePendingRequest(null), MAX_RESPONSE_DELAY);

    return new Promise((resolve, reject) => {
        this.pendingRequest = { resolve, reject, responseTimeout };
    });
};

ServiceMessages[CLIENT_MESSAGES.readyForBrowserManipulation] = async function (msg) {
    this.debugLog.driverMessage(msg);

    var result = null;
    var error  = null;

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
