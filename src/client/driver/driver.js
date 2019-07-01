import hammerhead from './deps/hammerhead';
import {
    RequestBarrier,
    pageUnloadBarrier,
    eventUtils,
    domUtils,
    preventRealEvents,
    disableRealEventsPreventing,
    waitFor,
    delay,
    getTimeLimitedPromise,
    browser
} from './deps/testcafe-core';

import {
    CHECK_IFRAME_DRIVER_LINK_DELAY,
    SEND_STATUS_REQUEST_TIME_LIMIT,
    SEND_STATUS_REQUEST_RETRY_DELAY,
    SEND_STATUS_REQUEST_RETRY_COUNT,
    CHECK_STATUS_RETRY_DELAY
} from '../../utils/browser-connection-timeouts';

import { StatusBar } from './deps/testcafe-ui';

import TEST_RUN_MESSAGES from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import {
    isBrowserManipulationCommand,
    isCommandRejectableByPageError,
    isExecutableInTopWindowOnly
} from '../../test-run/commands/utils';
import {
    UncaughtErrorOnPage,
    ClientFunctionExecutionInterruptionError,
    ActionElementNotIframeError,
    ActionIframeIsNotLoadedError,
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    CurrentIframeIsNotLoadedError,
    CurrentIframeNotFoundError,
    CurrentIframeIsInvisibleError,
    CannotObtainInfoForElementSpecifiedBySelectorError
} from '../../errors/test-run';

import BrowserConsoleMessages from '../../test-run/browser-console-messages';
import NativeDialogTracker from './native-dialog-tracker';

import { SetNativeDialogHandlerMessage, TYPE as MESSAGE_TYPE } from './driver-link/messages';
import ContextStorage from './storage';
import DriverStatus from './status';
import generateId from './generate-id';
import ChildDriverLink from './driver-link/child';

import executeActionCommand from './command-executors/execute-action';
import executeManipulationCommand from './command-executors/browser-manipulation';
import executeNavigateToCommand from './command-executors/execute-navigate-to';
import {
    getResult as getExecuteSelectorResult,
    getResultDriverStatus as getExecuteSelectorResultDriverStatus
} from './command-executors/execute-selector';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';

const transport      = hammerhead.transport;
const Promise        = hammerhead.Promise;
const messageSandbox = hammerhead.eventSandbox.message;
const storages       = hammerhead.storages;
const nativeMethods  = hammerhead.nativeMethods;
const DateCtor       = nativeMethods.date;

const TEST_DONE_SENT_FLAG                  = 'testcafe|driver|test-done-sent-flag';
const PENDING_STATUS                       = 'testcafe|driver|pending-status';
const EXECUTING_CLIENT_FUNCTION_DESCRIPTOR = 'testcafe|driver|executing-client-function-descriptor';
const SELECTOR_EXECUTION_START_TIME        = 'testcafe|driver|selector-execution-start-time';
const PENDING_PAGE_ERROR                   = 'testcafe|driver|pending-page-error';
const ACTIVE_IFRAME_SELECTOR               = 'testcafe|driver|active-iframe-selector';
const TEST_SPEED                           = 'testcafe|driver|test-speed';
const ASSERTION_RETRIES_TIMEOUT            = 'testcafe|driver|assertion-retries-timeout';
const ASSERTION_RETRIES_START_TIME         = 'testcafe|driver|assertion-retries-start-time';
const CONSOLE_MESSAGES                     = 'testcafe|driver|console-messages';

const ACTION_IFRAME_ERROR_CTORS = {
    NotLoadedError:   ActionIframeIsNotLoadedError,
    NotFoundError:    ActionElementNotFoundError,
    IsInvisibleError: ActionElementIsInvisibleError
};

const CURRENT_IFRAME_ERROR_CTORS = {
    NotLoadedError:   CurrentIframeIsNotLoadedError,
    NotFoundError:    CurrentIframeNotFoundError,
    IsInvisibleError: CurrentIframeIsInvisibleError
};


export default class Driver {
    constructor (testRunId, communicationUrls, runInfo, options) {
        this.COMMAND_EXECUTING_FLAG   = 'testcafe|driver|command-executing-flag';
        this.EXECUTING_IN_IFRAME_FLAG = 'testcafe|driver|executing-in-iframe-flag';

        this.testRunId            = testRunId;
        this.heartbeatUrl         = communicationUrls.heartbeat;
        this.browserStatusUrl     = communicationUrls.status;
        this.browserStatusDoneUrl = communicationUrls.statusDone;
        this.userAgent            = runInfo.userAgent;
        this.fixtureName          = runInfo.fixtureName;
        this.testName             = runInfo.testName;
        this.selectorTimeout      = options.selectorTimeout;
        this.pageLoadTimeout      = options.pageLoadTimeout;
        this.initialSpeed         = options.speed;
        this.skipJsErrors         = options.skipJsErrors;
        this.dialogHandler        = options.dialogHandler;

        this.customCommandHandlers = {};

        this.contextStorage       = null;
        this.nativeDialogsTracker = null;

        this.childDriverLinks      = [];
        this.activeChildDriverLink = null;

        this.statusBar = null;

        if (options.retryTestPages)
            browser.enableRetryingTestPages();

        this.pageInitialRequestBarrier = new RequestBarrier();

        this.readyPromise = eventUtils
            .documentReady(this.pageLoadTimeout)
            .then(() => this.pageInitialRequestBarrier.wait(true));

        this._initChildDriverListening();

        pageUnloadBarrier.init();
        preventRealEvents();

        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));
        hammerhead.on(hammerhead.EVENTS.unhandledRejection, err => this._onJsError(err));
        hammerhead.on(hammerhead.EVENTS.consoleMethCalled, e => this._onConsoleMessage(e));

        this.setCustomCommandHandlers(COMMAND_TYPE.unlockPage, () => this._unlockPageAfterTestIsDone());
    }

    set speed (val) {
        this.contextStorage.setItem(TEST_SPEED, val);
    }

    get speed () {
        return this.contextStorage.getItem(TEST_SPEED);
    }

    get consoleMessages () {
        return new BrowserConsoleMessages(this.contextStorage.getItem(CONSOLE_MESSAGES));
    }

    set consoleMessages (messages) {
        return this.contextStorage.setItem(CONSOLE_MESSAGES, messages ? messages.getCopy() : null);
    }

    // Error handling
    _onJsError (err) {
        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.skipJsErrors || this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
            return Promise.resolve();

        const error = new UncaughtErrorOnPage(err.stack, err.pageUrl);

        if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this.contextStorage.setItem(PENDING_PAGE_ERROR, error);

        return null;
    }

    _unlockPageAfterTestIsDone () {
        disableRealEventsPreventing();

        return Promise.resolve();
    }

    _failIfClientCodeExecutionIsInterrupted () {
        // NOTE: ClientFunction should be used primarily for observation. We raise
        // an error if the page was reloaded during ClientFunction execution.
        const executingClientFnDescriptor = this.contextStorage.getItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR);

        if (executingClientFnDescriptor) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new ClientFunctionExecutionInterruptionError(executingClientFnDescriptor.instantiationCallsiteName)
            }));

            return true;
        }

        return false;
    }

    // Console messages
    _onConsoleMessage ({ meth, line }) {
        const messages = this.consoleMessages;

        messages.addMessage(meth, line);

        this.consoleMessages = messages;
    }

    // Status
    _addPendingErrorToStatus (status) {
        const pendingPageError = this.contextStorage.getItem(PENDING_PAGE_ERROR);

        if (pendingPageError) {
            this.contextStorage.setItem(PENDING_PAGE_ERROR, null);
            status.pageError = pendingPageError;
        }
    }

    _addUnexpectedDialogErrorToStatus (status) {
        const dialogError = this.nativeDialogsTracker.getUnexpectedDialogError();

        status.pageError = status.pageError || dialogError;
    }

    _addConsoleMessagesToStatus (status) {
        status.consoleMessages = this.consoleMessages;
        this.consoleMessages   = null;
    }

    _sendStatusRequest (status) {
        const statusRequestOptions = {
            cmd:              TEST_RUN_MESSAGES.ready,
            status:           status,
            disableResending: true,
            allowRejecting:   true
        };

        const requestAttempt = () => getTimeLimitedPromise(transport.asyncServiceMsg(statusRequestOptions), SEND_STATUS_REQUEST_TIME_LIMIT);
        const retryRequest   = () => delay(SEND_STATUS_REQUEST_RETRY_DELAY).then(requestAttempt);

        let statusPromise = requestAttempt();

        for (let i = 0; i < SEND_STATUS_REQUEST_RETRY_COUNT; i++)
            statusPromise = statusPromise.catch(retryRequest);

        return statusPromise;
    }

    _sendStatus (status) {
        // NOTE: We should not modify the status if it is resent after
        // the page load because the server has cached the response
        if (!status.resent) {
            this._addPendingErrorToStatus(status);
            this._addUnexpectedDialogErrorToStatus(status);
            this._addConsoleMessagesToStatus(status);
        }

        this.contextStorage.setItem(PENDING_STATUS, status);

        let readyCommandResponse = null;

        // NOTE: postpone status sending if the page is unloading
        return pageUnloadBarrier
            .wait(0)
            .then(() => this._sendStatusRequest(status))
            //NOTE: do not execute the next command if the page is unloading
            .then(res => {
                readyCommandResponse = res;

                return pageUnloadBarrier.wait(0);
            })
            .then(() => {
                this.contextStorage.setItem(PENDING_STATUS, null);

                return readyCommandResponse;
            });
    }


    // Iframes interaction
    _initChildDriverListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            const msg          = e.message;
            const iframeWindow = e.source;

            if (msg.type === MESSAGE_TYPE.establishConnection) {
                let childDriverLink = this._getChildDriverLinkByWindow(iframeWindow);

                if (!childDriverLink) {
                    const driverId = `${this.testRunId}-${generateId()}`;

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

    _runInActiveIframe (command) {
        let runningChain           = Promise.resolve();
        const activeIframeSelector = this.contextStorage.getItem(ACTIVE_IFRAME_SELECTOR);

        // NOTE: if the page was reloaded we restore the active child driver link via the iframe selector
        if (!this.activeChildDriverLink && activeIframeSelector)
            runningChain = this._switchToIframe(activeIframeSelector, CURRENT_IFRAME_ERROR_CTORS);

        runningChain
            .then(() => {
                this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, true);

                return this.activeChildDriverLink.executeCommand(command, this.speed);
            })
            .then(status => this._onCommandExecutedInIframe(status))
            .catch(err => this._onCommandExecutedInIframe(new DriverStatus({
                isCommandResult: true,
                executionError:  err
            })));
    }

    _onCommandExecutedInIframe (status) {
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
        this._onReady(status);
    }

    _ensureChildDriverLink (iframeWindow, ErrorCtor, selectorTimeout) {
        // NOTE: a child driver should establish connection with the parent when it's loaded.
        // Here we are waiting while the appropriate child driver do this if it didn't do yet.
        return waitFor(() => this._getChildDriverLinkByWindow(iframeWindow), CHECK_IFRAME_DRIVER_LINK_DELAY, selectorTimeout)
            .catch(() => {
                throw new ErrorCtor();
            });
    }

    _switchToIframe (selector, iframeErrorCtors) {
        const hasSpecificTimeout     = typeof selector.timeout === 'number';
        const commandSelectorTimeout = hasSpecificTimeout ? selector.timeout : this.selectorTimeout;

        return getExecuteSelectorResult(selector, commandSelectorTimeout, null,
            fn => new iframeErrorCtors.NotFoundError(fn), () => new iframeErrorCtors.IsInvisibleError(), this.statusBar)
            .then(iframe => {
                if (!domUtils.isIframeElement(iframe))
                    throw new ActionElementNotIframeError();

                return this._ensureChildDriverLink(nativeMethods.contentWindowGetter.call(iframe),
                    iframeErrorCtors.NotLoadedError, commandSelectorTimeout);
            })
            .then(childDriverLink => {
                childDriverLink.availabilityTimeout = commandSelectorTimeout;
                this.activeChildDriverLink          = childDriverLink;
                this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, selector);
            });
    }

    _switchToMainWindow (command) {
        if (this.activeChildDriverLink)
            this.activeChildDriverLink.executeCommand(command);

        this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, null);
        this.activeChildDriverLink = null;
    }

    _setNativeDialogHandlerInIframes (dialogHandler) {
        const msg = new SetNativeDialogHandlerMessage(dialogHandler);

        for (let i = 0; i < this.childDriverLinks.length; i++)
            messageSandbox.sendServiceMsg(msg, this.childDriverLinks[i].driverWindow);
    }


    // Commands handling
    _onActionCommand (command) {
        const { startPromise, completionPromise } = executeActionCommand(command, this.selectorTimeout, this.statusBar, this.speed);

        startPromise.then(() => this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true));

        completionPromise
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);

                return this._onReady(driverStatus);
            });
    }

    _onSetNativeDialogHandlerCommand (command) {
        this.nativeDialogsTracker.setHandler(command.dialogHandler);
        this._setNativeDialogHandlerInIframes(command.dialogHandler);

        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onGetNativeDialogHistoryCommand () {
        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          this.nativeDialogsTracker.appearedDialogs
        }));
    }

    _onGetBrowserConsoleMessagesCommand () {
        this._onReady(new DriverStatus({ isCommandResult: true }));
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

        const executor = new ClientFunctionExecutor(command);

        executor.getResultDriverStatus()
            .then(driverStatus => {
                this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, null);
                this._onReady(driverStatus);
            });
    }

    _onExecuteSelectorCommand (command) {
        const startTime                   = this.contextStorage.getItem(SELECTOR_EXECUTION_START_TIME) || new DateCtor();
        const elementNotFoundOrNotVisible = fn => new CannotObtainInfoForElementSpecifiedBySelectorError(null, fn);
        const createError                 = command.needError ? elementNotFoundOrNotVisible : null;

        getExecuteSelectorResultDriverStatus(command,
            this.selectorTimeout,
            startTime,
            createError,
            createError,
            this.statusBar)
            .then(driverStatus => {
                this.contextStorage.setItem(SELECTOR_EXECUTION_START_TIME, null);
                this._onReady(driverStatus);
            });
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

    _onBrowserManipulationCommand (command) {
        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);

        executeManipulationCommand(command, this.selectorTimeout, this.statusBar)
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
                return this._onReady(driverStatus);
            });
    }

    _onSetBreakpointCommand (isTestError) {
        this.statusBar.showDebuggingStatus(isTestError)
            .then(stopAfterNextAction => this._onReady(new DriverStatus({
                isCommandResult: true,
                result:          stopAfterNextAction
            })));
    }

    _onSetTestSpeedCommand (command) {
        this.speed = command.speed;
        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onShowAssertionRetriesStatusCommand (command) {
        this.contextStorage.setItem(ASSERTION_RETRIES_TIMEOUT, command.timeout);
        this.contextStorage.setItem(ASSERTION_RETRIES_START_TIME, Date.now());

        this.statusBar.showWaitingAssertionRetriesStatus(command.timeout);
        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onHideAssertionRetriesStatusCommand (command) {
        this.contextStorage.setItem(ASSERTION_RETRIES_TIMEOUT, null);
        this.contextStorage.setItem(ASSERTION_RETRIES_START_TIME, null);

        this.statusBar.hideWaitingAssertionRetriesStatus(command.success)
            .then(() => this._onReady(new DriverStatus({ isCommandResult: true })));
    }

    _checkStatus () {
        return browser
            .checkStatus(this.browserStatusDoneUrl, hammerhead.createNativeXHR, { manualRedirect: true })
            .then(({ command, redirecting }) => {
                const isSessionChange = redirecting && command.url.indexOf(this.testRunId) < 0;

                if (isSessionChange) {
                    storages.clear();
                    storages.lock();
                }
                else
                    this.contextStorage.setItem(TEST_DONE_SENT_FLAG, false);

                if (redirecting)
                    browser.redirect(command);
                else
                    this._onReady({ isCommandResult: false });
            })
            .catch(() => {
                return delay(CHECK_STATUS_RETRY_DELAY);
            });
    }

    _onCustomCommand (command) {
        const handler = this.customCommandHandlers[command.type].handler;

        handler(command).then(result => {
            this._onReady(new DriverStatus({ isCommandResult: true, result }));
        });
    }

    _onTestDone (status) {
        this.contextStorage.setItem(TEST_DONE_SENT_FLAG, true);

        this
            ._sendStatus(status)
            .then(() => this._checkStatus());
    }

    _onBackupStoragesCommand () {
        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          storages.backup()
        }));
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

    _executeCommand (command) {
        if (this.customCommandHandlers[command.type])
            this._onCustomCommand(command);

        else if (command.type === COMMAND_TYPE.testDone)
            this._onTestDone(new DriverStatus({ isCommandResult: true }));

        else if (command.type === COMMAND_TYPE.setBreakpoint)
            this._onSetBreakpointCommand(command.isTestError);

        else if (command.type === COMMAND_TYPE.switchToMainWindow)
            this._onSwitchToMainWindowCommand(command);

        else if (command.type === COMMAND_TYPE.switchToIframe)
            this._onSwitchToIframeCommand(command);

        else if (isBrowserManipulationCommand(command))
            this._onBrowserManipulationCommand(command);

        else if (command.type === COMMAND_TYPE.executeClientFunction)
            this._onExecuteClientFunctionCommand(command);

        else if (command.type === COMMAND_TYPE.executeSelector)
            this._onExecuteSelectorCommand(command);

        else if (command.type === COMMAND_TYPE.navigateTo)
            this._onNavigateToCommand(command);

        else if (command.type === COMMAND_TYPE.setNativeDialogHandler)
            this._onSetNativeDialogHandlerCommand(command);

        else if (command.type === COMMAND_TYPE.getNativeDialogHistory)
            this._onGetNativeDialogHistoryCommand(command);

        else if (command.type === COMMAND_TYPE.getBrowserConsoleMessages)
            this._onGetBrowserConsoleMessagesCommand(command);

        else if (command.type === COMMAND_TYPE.setTestSpeed)
            this._onSetTestSpeedCommand(command);

        else if (command.type === COMMAND_TYPE.showAssertionRetriesStatus)
            this._onShowAssertionRetriesStatusCommand(command);

        else if (command.type === COMMAND_TYPE.hideAssertionRetriesStatus)
            this._onHideAssertionRetriesStatusCommand(command);

        else if (command.type === COMMAND_TYPE.backupStorages)
            this._onBackupStoragesCommand();

        else
            this._onActionCommand(command);
    }

    _isExecutableInTopWindowOnly (command) {
        if (isExecutableInTopWindowOnly(command))
            return true;

        const customCommandHandler = this.customCommandHandlers[command.type];

        return customCommandHandler && customCommandHandler.isExecutableInTopWindowOnly;
    }

    _onCommand (command) {
        // NOTE: the driver sends status to the server as soon as it's created,
        // but it should wait until the page is loaded before executing a command.
        this.readyPromise
            .then(() => {
                // NOTE: we should not execute a command if we already have a pending page error and this command is
                // rejectable by page errors. In this case, we immediately send status with this error to the server.
                const isCommandRejectableByError = isCommandRejectableByPageError(command);
                const pendingPageError           = this.contextStorage.getItem(PENDING_PAGE_ERROR);

                if (pendingPageError && isCommandRejectableByError) {
                    this._onReady(new DriverStatus({ isCommandResult: true }));
                    return;
                }

                // NOTE: we should execute a command in an iframe if the current execution context belongs to
                // this iframe and the command is not one of those that can be executed only in the top window.
                const isThereActiveIframe = this.activeChildDriverLink ||
                                          this.contextStorage.getItem(ACTIVE_IFRAME_SELECTOR);

                if (!this._isExecutableInTopWindowOnly(command) && isThereActiveIframe) {
                    this._runInActiveIframe(command);
                    return;
                }

                this._executeCommand(command);
            });
    }


    // API
    setCustomCommandHandlers (command, handler, executeInTopWindowOnly) {
        this.customCommandHandlers[command] = {
            isExecutableInTopWindowOnly: executeInTopWindowOnly,
            handler
        };
    }

    start () {
        this.contextStorage       = new ContextStorage(window, this.testRunId);
        this.nativeDialogsTracker = new NativeDialogTracker(this.contextStorage, this.dialogHandler);

        if (!this.speed)
            this.speed = this.initialSpeed;

        browser.startHeartbeat(this.heartbeatUrl, hammerhead.createNativeXHR);

        this.statusBar = new StatusBar(this.userAgent, this.fixtureName, this.testName);

        this.statusBar.on(this.statusBar.UNLOCK_PAGE_BTN_CLICK, disableRealEventsPreventing);

        this.readyPromise.then(() => {
            this.statusBar.hidePageLoadingStatus();

            const assertionRetriesTimeout = this.contextStorage.getItem(ASSERTION_RETRIES_TIMEOUT);

            if (assertionRetriesTimeout) {
                const startTime = this.contextStorage.getItem(ASSERTION_RETRIES_START_TIME);
                const timeLeft  = assertionRetriesTimeout - (new Date() - startTime);

                if (timeLeft > 0)
                    this.statusBar.showWaitingAssertionRetriesStatus(assertionRetriesTimeout, startTime);
            }
        });

        const pendingStatus = this.contextStorage.getItem(PENDING_STATUS);

        if (pendingStatus)
            pendingStatus.resent = true;

        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG)) {
            if (pendingStatus)
                this._onTestDone(pendingStatus);
            else
                this._checkStatus();

            return;
        }

        if (this._failIfClientCodeExecutionIsInterrupted())
            return;

        const inCommandExecution = this.contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
                                 this.contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);

        const status = pendingStatus || new DriverStatus({ isCommandResult: inCommandExecution });

        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);

        this._onReady(status);
    }
}
