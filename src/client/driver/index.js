import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';

import MESSAGE from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import { UncaughtErrorOnPage, ClientCodeExecutionInterruptionError } from '../../errors/test-run';

import * as browser from '../browser';
import executeActionCommand from './command-executors/execute-action-command';
import executeWaitForElementCommand from './command-executors/execute-wait-for-element-command';
import executeNavigateToCommand from './command-executors/execute-navigate-to-command';
import executeClientCode from './command-executors/execute-client-code';
import ContextStorage from './storage';
import DriverStatus from './status';

var transport         = hammerhead.transport;
var Promise           = hammerhead.Promise;
var RequestBarrier    = testCafeCore.RequestBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var eventUtils        = testCafeCore.eventUtils;
var modalBackground   = testCafeUI.modalBackground;


const COMMAND_EXECUTING_FLAG   = 'testcafe|driver|command-executing-flag';
const HYBRID_FN_EXECUTING_FLAG = 'testcafe|driver|hybrid-fn-executing-flag';
const PENDING_PAGE_ERROR       = 'testcafe|driver|pending-page-error';
const TEST_DONE_SENT_FLAG      = 'testcafe|driver|test-done-sent-flag';
const PENDING_STATUS           = 'testcafe|driver|pending-status';

var hangingPromise = new Promise(testCafeCore.noop);

export default class ClientDriver {
    constructor (testRunId, heartbeatUrl, browserStatusUrl, elementAvailabilityTimeout) {
        this.testRunId                  = testRunId;
        this.heartbeatUrl               = heartbeatUrl;
        this.browserStatusUrl           = browserStatusUrl;
        this.elementAvailabilityTimeout = elementAvailabilityTimeout;
        this.contextStorage             = new ContextStorage(window, testRunId);
        this.beforeUnloadRaised         = false;

        this.pageInitialRequestBarrier = new RequestBarrier();

        pageUnloadBarrier.init();
    }

    start () {
        browser.startHeartbeat(this.heartbeatUrl, hammerhead.createNativeXHR);

        modalBackground.initAndShowLoadingText();
        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));
        hammerhead.on(hammerhead.EVENTS.beforeUnload, () => this.beforeUnloadRaised = true);

        var pendingStatus = this.contextStorage.getItem(PENDING_STATUS, status);

        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG)) {
            if (pendingStatus)
                this._onTestDone();
            else
                browser.checkStatus(this.browserStatusUrl, hammerhead.createNativeXHR);

            return;
        }

        // NOTE: Hybrids should be used primarily for observation. We raise
        // an error if the page was reloaded during Hybrid function execution.
        if (this.contextStorage.getItem(HYBRID_FN_EXECUTING_FLAG)) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new ClientCodeExecutionInterruptionError()
            }));

            return;
        }

        eventUtils
            .documentReady()
            .then(() => this.pageInitialRequestBarrier.wait(true))
            .then(() => {
                var inCommandExecution = this.contextStorage.getItem(COMMAND_EXECUTING_FLAG);

                modalBackground.hide();

                var status = pendingStatus || new DriverStatus({ isCommandResult: inCommandExecution });

                this._onReady(status);
            });
    }

    _onJsError (err) {
        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
            return Promise.resolve();

        var error = new UncaughtErrorOnPage(err.msg || err.message, err.pageUrl);

        if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this.contextStorage.setItem(PENDING_PAGE_ERROR, error);
    }

    _addPendingErrorToStatus (status) {
        var pendingPageError = this.contextStorage.getItem(PENDING_PAGE_ERROR);

        if (pendingPageError) {
            this.contextStorage.setItem(PENDING_PAGE_ERROR, null);
            status.pageError = pendingPageError;
        }
    }

    _sendStatusToServer (status) {
        this._addPendingErrorToStatus(status);
        this.contextStorage.setItem(PENDING_STATUS, status);

        // NOTE: postpone status sending if the page is unloading
        if (this.beforeUnloadRaised)
            return hangingPromise;

        return transport
            .queuedAsyncServiceMsg({ cmd: MESSAGE.ready, status })
            .then(res => {
                //NOTE: do not execute the next command if the page is unloading
                if (this.beforeUnloadRaised)
                    return hangingPromise;

                this.contextStorage.setItem(PENDING_STATUS, null);

                return res;
            });
    }

    _onReady (status) {
        this._sendStatusToServer(status)
            .then(command => {
                if (command)
                    this._onCommand(command);

                // NOTE: the driver gets an empty response if TestRun doesn't get a new command within 2 minutes
                else
                    this._onReady(new DriverStatus());
            });
    }

    _onActionCommand (command) {
        var { startPromise, completionPromise } = executeActionCommand(command, this.elementAvailabilityTimeout);

        startPromise.then(() => this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, true));

        completionPromise
            .catch(err => this._onJsError(err))
            .then(driverStatus => {
                this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, false);

                return this._onReady(driverStatus);
            });
    }

    _onWaitForElementCommand (command) {
        executeWaitForElementCommand(command, this.elementAvailabilityTimeout)
            .then(driverStatus => this._onReady(driverStatus));
    }

    _onNavigateToCommand (command) {
        this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, true);

        executeNavigateToCommand(command)
            .then(driverStatus => {
                this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, false);

                return this._onReady(driverStatus);
            });
    }

    _onExecuteClientCodeCommand (command) {
        this.contextStorage.setItem(HYBRID_FN_EXECUTING_FLAG, true);

        executeClientCode(command)
            .then(driverStatus => {
                this.contextStorage.setItem(HYBRID_FN_EXECUTING_FLAG, false);
                this._onReady(driverStatus);
            });
    }

    _onCommand (command) {
        if (command.type === COMMAND_TYPE.testDone)
            this._onTestDone();

        else if (command.type === COMMAND_TYPE.executeClientCode)
            this._onExecuteClientCodeCommand(command);

        else if (this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this._onReady(new DriverStatus({ isCommandResult: true }));

        else if (command.type === COMMAND_TYPE.waitForElement)
            this._onWaitForElementCommand(command);

        else if (command.type === COMMAND_TYPE.navigateTo)
            this._onNavigateToCommand(command);

        else
            this._onActionCommand(command);
    }

    _onTestDone () {
        this.contextStorage.setItem(TEST_DONE_SENT_FLAG, true);

        this
            ._sendStatusToServer(new DriverStatus({ isCommandResult: true }))
            .then(() => browser.checkStatus(this.browserStatusUrl, hammerhead.createNativeXHR));
    }
}

Object.defineProperty(window, '%testCafeClientDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        ClientDriver
});
