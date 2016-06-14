import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';

import MESSAGE from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import { UncaughtErrorOnPage, ClientFunctionExecutionInterruptionError } from '../../errors/test-run';

import * as browser from '../browser';

import executeActionCommand from './command-executors/execute-action';
import executeWaitForElementCommand from './command-executors/execute-wait-for-element';
import executeNavigateToCommand from './command-executors/execute-navigate-to';
import prepareBrowserManipulation from './command-executors/prepare-browser-manipulation';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import SelectorExecutor from './command-executors/client-functions/selector-executor';


import ContextStorage from './storage';
import DriverStatus from './status';

var transport         = hammerhead.transport;
var Promise           = hammerhead.Promise;
var RequestBarrier    = testCafeCore.RequestBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var eventUtils        = testCafeCore.eventUtils;
var modalBackground   = testCafeUI.modalBackground;
var preventRealEvents = testCafeCore.preventRealEvents;


const COMMAND_EXECUTING_FLAG               = 'testcafe|driver|command-executing-flag';
const EXECUTING_CLIENT_FUNCTION_DESCRIPTOR = 'testcafe|driver|executing-client-function-descriptor';
const PENDING_PAGE_ERROR                   = 'testcafe|driver|pending-page-error';
const TEST_DONE_SENT_FLAG                  = 'testcafe|driver|test-done-sent-flag';
const PENDING_STATUS                       = 'testcafe|driver|pending-status';

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
        preventRealEvents();
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

        // NOTE: ClientFunction should be used primarily for observation. We raise
        // an error if the page was reloaded during ClientFunction execution.
        var executingClientFnDescriptor = this.contextStorage.getItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR);

        if (executingClientFnDescriptor) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new ClientFunctionExecutionInterruptionError(executingClientFnDescriptor.instantiationCallsiteName)
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

    _onExecuteClientFunctionCommand (command) {
        this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, { instantiationCallsiteName: command.instantiationCallsiteName });

        var executor = new ClientFunctionExecutor(command);

        executor.getResultDriverStatus()
            .then(driverStatus => {
                this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, null);
                this._onReady(driverStatus);
            });
    }

    _onExecuteSelectorCommand (command) {
        // TODO cross-page timeout
        var executor = new SelectorExecutor(command, this.elementAvailabilityTimeout);

        executor.getResultDriverStatus()
            .then(driverStatus => this._onReady(driverStatus));
    }

    _onPrepareBrowserManipulationCommand () {
        this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, true);

        prepareBrowserManipulation(this.testRunId)
            .then(driverStatus => {
                this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, false);
                return this._onReady(driverStatus);
            });
    }

    _onCommand (command) {
        if (command.type === COMMAND_TYPE.testDone)
            this._onTestDone();

        else if (command.type === COMMAND_TYPE.executeClientFunction)
            this._onExecuteClientFunctionCommand(command);

        else if (command.type === COMMAND_TYPE.executeSelector)
            this._onExecuteSelectorCommand(command);

        else if (this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this._onReady(new DriverStatus({ isCommandResult: true }));

        else if (command.type === COMMAND_TYPE.waitForElement)
            this._onWaitForElementCommand(command);

        else if (command.type === COMMAND_TYPE.navigateTo)
            this._onNavigateToCommand(command);

        else if (command.type === COMMAND_TYPE.prepareBrowserManipulation)
            this._onPrepareBrowserManipulationCommand();

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
