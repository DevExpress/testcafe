import path from 'path';
import assert from 'assert';
import { readSync as read } from 'read-file-relative';
import Promise from 'pinkie';
import Mustache from 'mustache';
import { Session } from 'testcafe-hammerhead';
import TestRunDebugLog from './debug-log';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import { TestDoneCommand, isTestDoneCommand, isCommandRejectableByPageError } from './commands';
import CLIENT_MESSAGES from './client-messages';
import STATE from './state';


//Const
const TEST_RUN_TEMPLATE = read('../client/test-run/index.js.mustache');


export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.opts               = opts;
        this.test               = test;
        this.browserConnection  = browserConnection;
        this.screenshotCapturer = screenshotCapturer;

        this.running = false;
        this.state   = STATE.initial;

        this.pendingCommand         = null;
        this.pendingRequest         = null;
        this.pendingJsError         = null;
        this.currentCommandCallsite = null;

        this.debugLog = new TestRunDebugLog(this.browserConnection.userAgent);

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-runner.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');

        this.errs = [];
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

    handlePageError () {
        // TODO
    }


    // Test function execution
    async _executeTestFn (state, fn) {
        this.state = state;

        try {
            await fn(this);
        }
        catch (err) {
            this._addError(err);
            return false;
        }

        return !this._addPendingErrorIfAny();
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
        this._addPendingErrorIfAny();

        delete TestRun.activeTestRuns[this.id];

        this.emit('done');
    }


    // Errors
    _addPendingErrorIfAny () {
        if (this.pendingJsError) {
            this._addError(this.pendingJsError);
            this.pendingJsError = null;
            return true;
        }

        return false;
    }

    _addError (err) {
        var adapter = new TestRunErrorFormattableAdapter(err, {
            userAgent:      this.browserConnection.userAgent,
            screenshotPath: '',
            callsite:       this.currentCommandCallsite,
            testRunState:   this.state
        });

        this.errs.push(adapter);
    }


    // Pending command and request
    _resolvePendingCommand (commandResult) {
        this.pendingCommand.resolve(commandResult);
        this.pendingCommand = null;
    }

    _rejectPendingCommand (err) {
        this.pendingCommand.reject(err);
        this.pendingCommand = null;
    }

    _resolvePendingRequest (command) {
        this.pendingRequest.resolve(command);
        this.pendingRequest = null;
    }

    _addPendingCommand (command) {
        return new Promise((resolve, reject) => this.pendingCommand = { command, resolve, reject });
    }


    // Execute command
    executeCommand (command, callsite) {
        assert(!this.pendingCommand, 'Internal error: an attempt to execute a command when a previous command is still being executed was detected.');

        this.debugLog.command(command);

        this.currentCommandCallsite = callsite;

        if (this.pendingJsError && isCommandRejectableByPageError(command)) {
            var result = Promise.reject(this.pendingJsError);

            this.pendingJsError = null;

            return result;
        }

        if (this.pendingRequest)
            this._resolvePendingRequest(command);

        return this._addPendingCommand(command);
    }
}


// Active test runs pool, used by hybrid functions
TestRun.activeTestRuns = {};


// Service message handlers
var ServiceMessages = TestRun.prototype;

ServiceMessages[CLIENT_MESSAGES.ready] = function (msg) {
    var commandResult = msg.commandResult;

    this.debugLog.driverMessage(msg);

    this.pendingRequest = null;

    if (!this.running)
        this._start();

    if (this.pendingCommand) {
        //NOTE: ignore client messages if testDone command is received
        if (commandResult && !isTestDoneCommand(this.pendingCommand)) {
            if (commandResult.failed)
                this._rejectPendingCommand(commandResult.err);
            else
                this._resolvePendingCommand(commandResult);
        }
        else
            return Promise.resolve(this.pendingCommand.command);
    }

    return new Promise((resolve, reject) => this.pendingRequest = { resolve, reject });
};

ServiceMessages[CLIENT_MESSAGES.jsError] = function (msg) {
    this.debugLog.error(msg.err);

    if (this.pendingCommand && isCommandRejectableByPageError(this.pendingCommand))
        this._rejectPendingCommand(msg.err);
    else
        this.pendingJsError = msg.err;
};

ServiceMessages[CLIENT_MESSAGES.done] = function () {
    this.debugLog.testDone();
    this.pendingCommand.resolve();
};
