import hammerhead from './deps/hammerhead';
import { RequestBarrier, noop, pageUnloadBarrier, eventUtils, domUtils, preventRealEvents, waitFor } from './deps/testcafe-core';
import { modalBackground } from './deps/testcafe-ui';

import TEST_RUN_MESSAGES from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import {
    UncaughtErrorOnPage,
    ClientFunctionExecutionInterruptionError,
    ActionElementNotIframe,
    ActionIframeIsNotLoadedError,
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    CurrentIframeIsNotLoadedError,
    CurrentIframeNotFoundError,
    CurrentIframeIsInvisibleError
} from '../../errors/test-run';
import * as browser from '../browser';

import { TYPE as MESSAGE_TYPE } from './driver-link/messages';
import ContextStorage from './storage';
import DriverStatus from './status';
import generateId from './generate-id';
import ChildDriverLink from './driver-link/child';

import prepareBrowserManipulation from './command-executors/prepare-browser-manipulation';
import executeActionCommand from './command-executors/execute-action';
import executeNavigateToCommand from './command-executors/execute-navigate-to';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import SelectorExecutor from './command-executors/client-functions/selector-executor';

var transport      = hammerhead.transport;
var Promise        = hammerhead.Promise;
var messageSandbox = hammerhead.eventSandbox.message;


const TEST_DONE_SENT_FLAG                  = 'testcafe|driver|test-done-sent-flag';
const PENDING_STATUS                       = 'testcafe|driver|pending-status';
const EXECUTING_CLIENT_FUNCTION_DESCRIPTOR = 'testcafe|driver|executing-client-function-descriptor';
const PENDING_PAGE_ERROR                   = 'testcafe|driver|pending-page-error';
const ACTUAL_CHILD_DRIVER_IFRAME_SELECTOR  = 'testcafe|driver|actual-child-driver-iframe-selector';
const CHECK_IFRAME_DRIVER_LINK_DELAY       = 500;

const ACTION_IFRAME_ERROR_CTORS = {
    NotLoaded: ActionIframeIsNotLoadedError,
    NotFound:  ActionElementNotFoundError,
    Invisible: ActionElementIsInvisibleError
};

const CURRENT_IFRAME_ERROR_CTORS = {
    NotLoaded: CurrentIframeIsNotLoadedError,
    NotFound:  CurrentIframeNotFoundError,
    Invisible: CurrentIframeIsInvisibleError
};


var hangingPromise = new Promise(noop);

export default class Driver {
    constructor (testRunId, elementAvailabilityTimeout, heartbeatUrl, browserStatusUrl) {
        this.COMMAND_EXECUTING_FLAG   = 'testcafe|driver|command-executing-flag';
        this.EXECUTING_IN_IFRAME_FLAG = 'testcafe|driver|executing-in-iframe-flag';

        this.testRunId                  = testRunId;
        this.elementAvailabilityTimeout = elementAvailabilityTimeout;
        this.heartbeatUrl               = heartbeatUrl;
        this.browserStatusUrl           = browserStatusUrl;

        this.contextStorage        = null;
        this.childDriverLinks      = [];
        this.actualChildDriverLink = null;
        this.beforeUnloadRaised    = false;

        this.pageInitialRequestBarrier = new RequestBarrier();

        this.readyPromise = eventUtils
            .documentReady()
            .then(() => this.pageInitialRequestBarrier.wait(true));

        this._initChildDriverListening();

        pageUnloadBarrier.init();
        preventRealEvents();

        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));
        hammerhead.on(hammerhead.EVENTS.beforeUnload, () => this.beforeUnloadRaised = true);
    }

    // Error handling
    _onJsError (err) {
        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
            return Promise.resolve();

        var error = new UncaughtErrorOnPage(err.msg || err.message, err.pageUrl);

        if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this.contextStorage.setItem(PENDING_PAGE_ERROR, error);
    }

    _failIfClientCodeExecutionIsInterrupted () {
        // NOTE: ClientFunction should be used primarily for observation. We raise
        // an error if the page was reloaded during ClientFunction execution.
        var executingClientFnDescriptor = this.contextStorage.getItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR);

        if (executingClientFnDescriptor) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new ClientFunctionExecutionInterruptionError(executingClientFnDescriptor.instantiationCallsiteName)
            }));

            return true;
        }

        return false;
    }


    // Status
    _addPendingErrorToStatus (status) {
        var pendingPageError = this.contextStorage.getItem(PENDING_PAGE_ERROR);

        if (pendingPageError) {
            this.contextStorage.setItem(PENDING_PAGE_ERROR, null);
            status.pageError = pendingPageError;
        }
    }

    _sendStatus (status) {
        this._addPendingErrorToStatus(status);
        this.contextStorage.setItem(PENDING_STATUS, status);

        // NOTE: postpone status sending if the page is unloading
        if (this.beforeUnloadRaised)
            return hangingPromise;

        return transport
            .queuedAsyncServiceMsg({ cmd: TEST_RUN_MESSAGES.ready, status })
            .then(res => {
                //NOTE: do not execute the next command if the page is unloading
                if (this.beforeUnloadRaised)
                    return hangingPromise;

                this.contextStorage.setItem(PENDING_STATUS, null);

                return res;
            });
    }


    // Iframes interaction
    _initChildDriverListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            var msg          = e.message;
            var iframeWindow = e.source;

            if (msg.type === MESSAGE_TYPE.establishConnection) {
                var childDriverLink = this._getChildDriverLinkByWindow(iframeWindow);

                if (!childDriverLink) {
                    var driverId = `${this.testRunId}-${generateId()}`;

                    childDriverLink = new ChildDriverLink(iframeWindow, driverId);
                    this.childDriverLinks.push(childDriverLink);
                }

                childDriverLink.confirmConnectionEstablished(msg.id);
            }
        });
    }

    _getChildDriverLinkByWindow (driverWindow) {
        return this.childDriverLinks.filter(link => link.driverWindow === driverWindow)[0];
    }

    _runInActualIframe (command) {
        var runningChain                    = Promise.resolve();
        var actualChildDriverIframeSelector = this.contextStorage.getItem(ACTUAL_CHILD_DRIVER_IFRAME_SELECTOR);

        // NOTE: if the page was reloaded we restore the actual child iframe driver link via the iframe selector
        if (!this.actualChildDriverLink && actualChildDriverIframeSelector)
            runningChain = this._switchToIframe(actualChildDriverIframeSelector, CURRENT_IFRAME_ERROR_CTORS);

        runningChain
            .then(() => {
                this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, true);

                return this.actualChildDriverLink.executeCommand(command);
            })
            .then(status => this._onCommandExecutedInIframe(status))
            .catch(err => this._onCommandExecutedInIframe(new DriverStatus({ isCommandResult: true, executionError: err })));
    }

    _onCommandExecutedInIframe (status) {
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
        this._onReady(status);
    }

    _ensureChildDriverLink (iframeWindow, ErrorCtor) {
        // NOTE: a child driver should establish connection with the parent when it's loaded.
        // Here we are waiting while the appropriate child driver do this if it didn't do yet.
        return waitFor(() => this._getChildDriverLinkByWindow(iframeWindow), CHECK_IFRAME_DRIVER_LINK_DELAY, this.elementAvailabilityTimeout)
            .catch(() => {
                throw new ErrorCtor();
            });
    }

    _switchToIframe (selector, iframeErrorCtors) {
        var selectorExecutor = new SelectorExecutor(selector, this.elementAvailabilityTimeout, () => new iframeErrorCtors.NotFound(),
            () => iframeErrorCtors.Invisible());

        return selectorExecutor.getResult()
            .then(iframe => {
                if (!domUtils.isIframeElement(iframe))
                    throw new ActionElementNotIframe();

                return this._ensureChildDriverLink(iframe.contentWindow, iframeErrorCtors.NotLoaded);
            })
            .then(childDriverLink => {
                this.actualChildDriverLink = childDriverLink;
                this.contextStorage.setItem(ACTUAL_CHILD_DRIVER_IFRAME_SELECTOR, selector);
            });
    }

    _switchToMainWindow (command) {
        if (this.actualChildDriverLink)
            this.actualChildDriverLink.executeCommand(command);

        this.contextStorage.setItem(ACTUAL_CHILD_DRIVER_IFRAME_SELECTOR, null);
        this.actualChildDriverLink = null;
    }


    // Commands handling
    _onActionCommand (command) {
        var { startPromise, completionPromise } = executeActionCommand(command, this.elementAvailabilityTimeout);

        startPromise.then(() => this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true));

        completionPromise
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);

                return this._onReady(driverStatus);
            });
    }

    _onNavigateToCommand (command) {
        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);

        executeNavigateToCommand(command)
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);

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

    _onSwitchToMainWindowCommand (command) {
        this._switchToMainWindow(command);

        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onSwitchToIframeCommand (command) {
        this
            ._switchToIframe(command.selector, ACTION_IFRAME_ERROR_CTORS)
            .then(() => this._onReady(new DriverStatus({ isCommandResult: true })))
            .catch(err => this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  err
            })));
    }

    _onPrepareBrowserManipulationCommand () {
        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);

        prepareBrowserManipulation(this.testRunId)
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
                return this._onReady(driverStatus);
            });
    }

    _onTestDone () {
        this.contextStorage.setItem(TEST_DONE_SENT_FLAG, true);

        this
            ._sendStatus(new DriverStatus({ isCommandResult: true }))
            .then(() => browser.checkStatus(this.browserStatusUrl, hammerhead.createNativeXHR));
    }


    // Routing
    _onReady (status) {
        this._sendStatus(status)
            .then(command => {
                if (command)
                    this._onCommand(command);

                // NOTE: the driver gets an empty response if TestRun doesn't get a new command within 2 minutes
                else
                    this._onReady(new DriverStatus());
            });
    }

    _onCommand (command) {
        // NOTE: the driver sends status to the server as soon as it's created,
        // but it should wait until the page is loaded before executing a command.
        this.readyPromise
            .then(() => {
                if (command.type === COMMAND_TYPE.testDone)
                    this._onTestDone();

                else if (command.type === COMMAND_TYPE.prepareBrowserManipulation)
                    this._onPrepareBrowserManipulationCommand();

                else if (command.type === COMMAND_TYPE.switchToMainWindow)
                    this._onSwitchToMainWindowCommand(command);

                else if (this.actualChildDriverLink || this.contextStorage.getItem(ACTUAL_CHILD_DRIVER_IFRAME_SELECTOR))
                    this._runInActualIframe(command);

                else if (command.type === COMMAND_TYPE.switchToIframe)
                    this._onSwitchToIframeCommand(command);

                else if (command.type === COMMAND_TYPE.executeClientFunction)
                    this._onExecuteClientFunctionCommand(command);

                else if (command.type === COMMAND_TYPE.executeSelector)
                    this._onExecuteSelectorCommand(command);

                else if (this.contextStorage.getItem(PENDING_PAGE_ERROR))
                    this._onReady(new DriverStatus({ isCommandResult: true }));

                else if (command.type === COMMAND_TYPE.navigateTo)
                    this._onNavigateToCommand(command);

                else
                    this._onActionCommand(command);
            });

    }


    // API
    start () {
        this.contextStorage = new ContextStorage(window, this.testRunId);

        browser.startHeartbeat(this.heartbeatUrl, hammerhead.createNativeXHR);

        modalBackground.initAndShowLoadingText();
        this.readyPromise.then(() => modalBackground.hide());

        var pendingStatus = this.contextStorage.getItem(PENDING_STATUS);

        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG)) {
            if (pendingStatus)
                this._onTestDone();
            else
                browser.checkStatus(this.browserStatusUrl, hammerhead.createNativeXHR);

            return;
        }

        if (this._failIfClientCodeExecutionIsInterrupted())
            return;

        var inCommandExecution = this.contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
                                 this.contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);

        var status = pendingStatus || new DriverStatus({ isCommandResult: inCommandExecution });

        this._onReady(status);
    }
}
