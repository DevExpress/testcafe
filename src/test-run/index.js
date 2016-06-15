import path from 'path';
import { readSync as read } from 'read-file-relative';
import Promise from 'pinkie';
import Mustache from 'mustache';
import { Session } from 'testcafe-hammerhead';
import TestRunDebugLog from './debug-log';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import { PageLoadError } from '../errors/test-run/';
import BrowserManipulationManager from './browser-manipulation-manager';
import CLIENT_MESSAGES from './client-messages';
import STATE from './state';
import COMMAND_TYPE from './commands/type';

import {
    TestDoneCommand,
    TakeScreenshotOnFailCommand,
    PrepareBrowserManipulationCommand,
    isCommandRejectableByPageError,
    isWindowManipulationCommand,
    isServiceCommand
} from './commands';


//Const
const TEST_RUN_TEMPLATE               = read('../client/test-run/index.js.mustache');
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY              = 2 * 60 * 1000;


export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.opts                       = opts;
        this.test                       = test;
        this.browserConnection          = browserConnection;
        this.browserManipulationManager = new BrowserManipulationManager(screenshotCapturer);

        this.running = false;
        this.state   = STATE.initial;

        this.driverTaskQueue          = [];
        this.browserManipulationQueue = [];
        this.testDoneCommandQueued    = false;

        this.pendingRequest   = null;
        this.pendingPageError = null;

        this.debugLog = new TestRunDebugLog(this.browserConnection.userAgent);

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-runner.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');

        this.errs                     = [];
        this.lastDriverStatusId       = null;
        this.lastDriverStatusResponse = null;
    }


    // Hammerhead payload
    _getPayloadScript () {
        return Mustache.render(TEST_RUN_TEMPLATE, {
            testRunId:                  this.id,
            browserHeartbeatUrl:        this.browserConnection.heartbeatUrl,
            browserStatusUrl:           this.browserConnection.statusUrl,
            elementAvailabilityTimeout: this.opts.elementAvailabilityTimeout
        });
    }

    _getIframePayloadScript () {
        // TODO
    }


    // Hammerhead handlers
    getAuthCredentials () {
        // TODO
    }

    handleFileDownload () {
        // TODO
    }

    handlePageError (ctx, err) {
        this.pendingPageError = new PageLoadError(err);

        ctx.redirect(ctx.toProxyUrl('about:error'));
    }


    // Test function execution
    async _executeTestFn (state, fn) {
        this.state = state;

        try {
            await fn(this);
        }
        catch (err) {
            var screenshotPath = null;

            if (this.opts.takeScreenshotsOnFails)
                screenshotPath = await this.executeCommand(new TakeScreenshotOnFailCommand());

            this._addError(err, screenshotPath);
            return false;
        }

        return !this._addPendingPageErrorIfAny();
    }

    async _start () {
        var beforeEachFn = this.test.fixture.beforeEachFn;
        var afterEachFn  = this.test.fixture.afterEachFn;

        TestRun.activeTestRuns[this.id] = this;

        this.running = true;
        this.emit('start');

        if (!beforeEachFn || await this._executeTestFn(STATE.inBeforeEach, beforeEachFn)) {
            await this._executeTestFn(STATE.inTest, this.test.fn);

            if (afterEachFn)
                await this._executeTestFn(STATE.inAfterEach, afterEachFn);
        }

        await this.executeCommand(new TestDoneCommand());
        this._addPendingPageErrorIfAny();

        delete TestRun.activeTestRuns[this.id];

        this.emit('done');
    }


    // Errors
    _addPendingPageErrorIfAny () {
        if (this.pendingPageError) {
            this._addError(this.pendingPageError);
            this.pendingPageError = null;
            return true;
        }

        return false;
    }

    _addError (err, screenshotPath) {
        var adapter = new TestRunErrorFormattableAdapter(err, {
            userAgent:      this.browserConnection.userAgent,
            screenshotPath: screenshotPath || '',
            testRunState:   this.state
        });

        this.errs.push(adapter);
    }


    // Task queue
    _enqueueCommand (command, callsite) {
        if (this.pendingRequest)
            this._resolvePendingRequest(command);

        return new Promise((resolve, reject) => this.driverTaskQueue.push({ command, resolve, reject, callsite }));
    }

    _removeAllNonServiceTasks () {
        this.driverTaskQueue = this.driverTaskQueue.filter(driverTask => isServiceCommand(driverTask.command));
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
        if (!this.running)
            this._start();

        var pageError = this.pendingPageError || driverStatus.pageError;

        var currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (this.currentDriverTask.command.type === COMMAND_TYPE.testDone) {
                this._resolveCurrentDriverTask();

                return TEST_DONE_CONFIRMATION_RESPONSE;
            }

            this._fulfillCurrentDriverTask(driverStatus);
        }

        return this.currentDriverTask ? this.currentDriverTask.command : null;
    }

    // Execute command
    executeCommand (command, callsite) {
        this.debugLog.command(command);

        if (this.pendingPageError && isCommandRejectableByPageError(command))
            return this._rejectCommandWithPageError(callsite);

        if (isWindowManipulationCommand(command)) {
            this.browserManipulationQueue.push(command);

            return this.executeCommand(new PrepareBrowserManipulationCommand());
        }

        if (command.type === COMMAND_TYPE.wait)
            return new Promise(resolve => setTimeout(resolve, command.timeout));

        if (command.type === COMMAND_TYPE.testDone)
            this.testDoneCommandQueued = true;

        return this._enqueueCommand(command, callsite);
    }

    _rejectCommandWithPageError (callsite) {
        var err = this.pendingPageError;

        err.callsite          = callsite;
        this.pendingPageError = null;

        return Promise.reject(err);
    }
}


// Active test runs pool, used by hybrid functions
TestRun.activeTestRuns = {};


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

    return new Promise((resolve, reject) => this.pendingRequest = { resolve, reject, responseTimeout });
};

ServiceMessages[CLIENT_MESSAGES.readyForBrowserManipulation] = async function (msg) {
    this.debugLog.driverMessage(msg);

    var command = this.browserManipulationQueue.shift();

    if (command.type === COMMAND_TYPE.takeScreenshot)
        return await this.browserManipulationManager.takeScreenshot(this.id, command.path);

    if (command.type === COMMAND_TYPE.takeScreenshotOnFail)
        return await this.browserManipulationManager.takeScreenshotOnFail(this.id);

    if (command.type === COMMAND_TYPE.resizeWindow)
        return await BrowserManipulationManager.resizeWindow(this.id, msg.currentWidth, msg.currentHeight, command.width, command.height);

    if (command.type === COMMAND_TYPE.resizeWindowToFitDevice)
        return await BrowserManipulationManager.resizeWindowToFitDevice(this.id, msg.currentWidth, msg.currentHeight, command.device, command.portrait);
};
