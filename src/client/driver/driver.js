import hammerhead from './deps/hammerhead';
import {
    RequestBarrier,
    pageUnloadBarrier,
    eventUtils,
    domUtils,
    arrayUtils,
    serviceUtils,
    preventRealEvents,
    disableRealEventsPreventing,
    waitFor,
    delay,
    getTimeLimitedPromise,
    browser
} from './deps/testcafe-core';

import { cursor } from './deps/testcafe-automation';

import { StatusBar } from './deps/testcafe-ui';

import {
    CHECK_IFRAME_DRIVER_LINK_DELAY,
    SEND_STATUS_REQUEST_TIME_LIMIT,
    SEND_STATUS_REQUEST_RETRY_DELAY,
    SEND_STATUS_REQUEST_RETRY_COUNT,
    CHECK_STATUS_RETRY_DELAY,
    CHECK_CHILD_WINDOW_DRIVER_LINK_DELAY
} from '../../utils/browser-connection-timeouts';

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
    CannotObtainInfoForElementSpecifiedBySelectorError,
    UncaughtErrorInCustomClientScriptCode,
    UncaughtErrorInCustomClientScriptLoadedFromModule,
    ChildWindowIsNotLoadedError,
    CannotSwitchToWindowError,
    CloseChildWindowError,
    ChildWindowClosedBeforeSwitchingError
} from '../../errors/test-run';

import BrowserConsoleMessages from '../../test-run/browser-console-messages';
import NativeDialogTracker from './native-dialog-tracker';

import { SetNativeDialogHandlerMessage, TYPE as MESSAGE_TYPE } from './driver-link/messages';
import ContextStorage from './storage';
import DriverStatus from './status';
import generateId from './generate-id';
import ChildIframeDriverLink from './driver-link/iframe/child';

import executeActionCommand from './command-executors/execute-action';
import executeManipulationCommand from './command-executors/browser-manipulation';
import executeNavigateToCommand from './command-executors/execute-navigate-to';
import {
    getResult as getExecuteSelectorResult,
    getResultDriverStatus as getExecuteSelectorResultDriverStatus
} from './command-executors/execute-selector';
import executeChildWindowDriverLinkSelector from './command-executors/execute-child-window-driver-link-selector';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import ChildWindowDriverLink from './driver-link/window/child';
import ParentWindowDriverLink from './driver-link/window/parent';
import sendConfirmationMessage from './driver-link/send-confirmation-message';
import DriverRole from './role';
import { CHECK_CHILD_WINDOW_CLOSED_INTERVAL } from './driver-link/timeouts';

const settings = hammerhead.get('./settings');

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

const COMMAND_EXECUTION_MAX_TIMEOUT    = Math.pow(2, 31) - 1;
const EMPTY_COMMAND_EVENT_WAIT_TIMEOUT = 30 * 1000;

const STATUS_WITH_COMMAND_RESULT_EVENT = 'status-with-command-result-event';
const EMPTY_COMMAND_EVENT              = 'empty-command-event';

export default class Driver extends serviceUtils.EventEmitter {
    constructor (testRunId, communicationUrls, runInfo, options) {
        super();

        this.COMMAND_EXECUTING_FLAG        = 'testcafe|driver|command-executing-flag';
        this.EXECUTING_IN_IFRAME_FLAG      = 'testcafe|driver|executing-in-iframe-flag';
        this.PENDING_WINDOW_SWITCHING_FLAG = 'testcafe|driver|pending-window-switching-flag';

        this.testRunId                  = testRunId;
        this.heartbeatUrl               = communicationUrls.heartbeat;
        this.browserStatusUrl           = communicationUrls.status;
        this.browserStatusDoneUrl       = communicationUrls.statusDone;
        this.browserActiveWindowId      = communicationUrls.activeWindowId;
        this.userAgent                  = runInfo.userAgent;
        this.fixtureName                = runInfo.fixtureName;
        this.testName                   = runInfo.testName;
        this.selectorTimeout            = options.selectorTimeout;
        this.pageLoadTimeout            = options.pageLoadTimeout;
        this.childWindowReadyTimeout    = options.childWindowReadyTimeout;
        this.initialSpeed               = options.speed;
        this.skipJsErrors               = options.skipJsErrors;
        this.dialogHandler              = options.dialogHandler;
        this.canUseDefaultWindowActions = options.canUseDefaultWindowActions;
        this.isFirstPageLoad            = settings.get().isFirstPageLoad;

        this.customCommandHandlers = {};

        this.contextStorage       = null;
        this.nativeDialogsTracker = null;

        this.childIframeDriverLinks      = [];
        this.activeChildIframeDriverLink = null;

        this.childWindowDriverLinks = [];
        this.parentWindowDriverLink = null;

        this.statusBar = null;

        this.windowId                         = this._getCurrentWindowId();
        this.role                             = DriverRole.replica;
        this.setAsMasterInProgress            = false;
        this.checkClosedChildWindowIntervalId = null;

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
        hammerhead.on(hammerhead.EVENTS.beforeFormSubmit, e => this._onFormSubmit(e));
        hammerhead.on(hammerhead.EVENTS.windowOpened, e => this._onChildWindowOpened(e));

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

    _hasPendingActionFlags (contextStorage) {
        return contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
            contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);
    }

    _getCurrentWindowId () {
        const currentUrl     = window.location.toString();
        const parsedProxyUrl = hammerhead.utils.url.parseProxyUrl(currentUrl);

        return parsedProxyUrl && parsedProxyUrl.windowId || null;
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

    onCustomClientScriptError (err, moduleName) {
        const error = moduleName
            ? new UncaughtErrorInCustomClientScriptLoadedFromModule(err, moduleName)
            : new UncaughtErrorInCustomClientScriptCode(err);

        if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this.contextStorage.setItem(PENDING_PAGE_ERROR, error);
    }

    _addChildWindowDriverLink (e) {
        const childWindowDriverLink = new ChildWindowDriverLink(e.window, e.windowId);

        this.childWindowDriverLinks.push(childWindowDriverLink);
        this._ensureClosedChildWindowWatcher();
    }

    _ensureClosedChildWindowWatcher () {
        if (this.checkClosedChildWindowIntervalId)
            return;

        this.checkClosedChildWindowIntervalId = nativeMethods.setInterval.call(window, () => {
            const firstClosedChildWindowDriverLink = arrayUtils.find(this.childWindowDriverLinks, childWindowDriverLink => childWindowDriverLink.driverWindow.closed);

            if (!firstClosedChildWindowDriverLink)
                return;

            arrayUtils.remove(this.childWindowDriverLinks, firstClosedChildWindowDriverLink);
            this._setCurrentWindowAsMaster();

            if (!this.childWindowDriverLinks.length)
                nativeMethods.clearInterval.call(window, this.checkClosedChildWindowIntervalId);
        }, CHECK_CHILD_WINDOW_CLOSED_INTERVAL);
    }

    _setAsMasterInProgressOrCompleted () {
        return this.setAsMasterInProgress || this.role === DriverRole.master;
    }

    _setCurrentWindowAsMaster () {
        if (this._setAsMasterInProgressOrCompleted())
            return;

        this.setAsMasterInProgress = true;

        Promise.resolve()
            .then(() => {
                return browser.setActiveWindowId(this.browserActiveWindowId, hammerhead.createNativeXHR, this.windowId);
            })
            .then(() => {
                this._startInternal({
                    finalizePendingCommand:             true,
                    isFirstRequestAfterWindowSwitching: true
                });

                this.setAsMasterInProgress = false;
            })
            .catch(() => {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError()
                }));
            });
    }

    _onChildWindowOpened (e) {
        this._addChildWindowDriverLink(e);
        this._switchToChildWindow(e.windowId);
    }

    // HACK: For https://github.com/DevExpress/testcafe/issues/3560
    // We have to cancel every form submit after a test is done
    // to prevent requests to a closed session
    _onFormSubmit (e) {
        // NOTE: We need to refactor this code to avoid the undefined value in contextStorage
        // https://github.com/DevExpress/testcafe/issues/4360
        if (this.contextStorage && this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
            e.preventSubmit = true;
    }

    // Console messages
    _onConsoleMessage ({ meth, line }) {
        const messages = this.consoleMessages;

        messages.addMessage(meth, line, this.windowId);

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

    _addPendingWindowSwitchingStateToStatus (status) {
        status.isPendingWindowSwitching = !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
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
            this._addPendingWindowSwitchingStateToStatus(status);
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


    // Iframes and child windows interaction
    _addChildIframeDriverLink (id, driverWindow) {
        let childIframeDriverLink = this._getChildIframeDriverLinkByWindow(driverWindow);

        if (!childIframeDriverLink) {
            const driverId = `${this.testRunId}-${generateId()}`;

            childIframeDriverLink = new ChildIframeDriverLink(driverWindow, driverId);

            this.childIframeDriverLinks.push(childIframeDriverLink);
        }

        childIframeDriverLink.sendConfirmationMessage(id);
    }

    _handleSetAsMasterMessage (msg, wnd) {
        // NOTE: The 'setAsMaster' message can be send a few times because
        // the 'sendMessageToDriver' function resend messages if the message confirmation is not received in 1 sec.
        // This message can be send even after driver is started.
        if (this._setAsMasterInProgressOrCompleted())
            return;

        this.setAsMasterInProgress = true;

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd
        });

        Promise.resolve()
            .then(() => {
                return browser.setActiveWindowId(this.browserActiveWindowId, hammerhead.createNativeXHR, this.windowId);
            })
            .then(() => {
                this._startInternal();

                this.setAsMasterInProgress = false;
            })
            .catch(() => {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError()
                }));
            });
    }

    _handleCloseAllWindowsMessage (msg, wnd) {
        this._closeAllChildWindows()
            .then(() => {
                sendConfirmationMessage({
                    requestMsgId: msg.id,
                    window:       wnd
                });
            })
            .catch(() => {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CloseChildWindowError()
                }));
            });
    }

    _initChildDriverListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            const msg    = e.message;
            const window = e.source;

            if (msg.type === MESSAGE_TYPE.establishConnection)
                this._addChildIframeDriverLink(msg.id, window);
            else if (msg.type === MESSAGE_TYPE.setAsMaster)
                this._handleSetAsMasterMessage(msg, window);
            else if (msg.type === MESSAGE_TYPE.closeAllChildWindows)
                this._handleCloseAllWindowsMessage(msg, window);
        });
    }

    _getChildIframeDriverLinkByWindow (driverWindow) {
        return arrayUtils.find(this.childIframeDriverLinks, link => link.driverWindow === driverWindow);
    }

    _getChildWindowDriverLinkByWindow (childDriverWindow) {
        return arrayUtils.find(this.childWindowDriverLinks, link => link.driverWindow === childDriverWindow);
    }

    _runInActiveIframe (command) {
        let runningChain           = Promise.resolve();
        const activeIframeSelector = this.contextStorage.getItem(ACTIVE_IFRAME_SELECTOR);

        // NOTE: if the page was reloaded we restore the active child driver link via the iframe selector
        if (!this.activeChildIframeDriverLink && activeIframeSelector)
            runningChain = this._switchToIframe(activeIframeSelector, CURRENT_IFRAME_ERROR_CTORS);

        runningChain
            .then(() => {
                this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, true);

                return this.activeChildIframeDriverLink.executeCommand(command, this.speed);
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

    _ensureChildIframeDriverLink (iframeWindow, ErrorCtor, selectorTimeout) {
        // NOTE: a child iframe driver should establish connection with the parent when it's loaded.
        // Here we are waiting while the appropriate child iframe driver do this if it didn't do yet.
        return waitFor(() => this._getChildIframeDriverLinkByWindow(iframeWindow), CHECK_IFRAME_DRIVER_LINK_DELAY, selectorTimeout)
            .catch(() => {
                throw new ErrorCtor();
            });
    }

    _ensureChildWindowDriverLink (childWindow, ErrorCtor, timeout) {
        // NOTE: a child window driver should establish connection with the parent when it's loaded.
        // Here we are waiting while the appropriate child window driver do this if it didn't do yet.
        return waitFor(() => this._getChildWindowDriverLinkByWindow(childWindow), CHECK_CHILD_WINDOW_DRIVER_LINK_DELAY, timeout)
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

                return this._ensureChildIframeDriverLink(nativeMethods.contentWindowGetter.call(iframe),
                    iframeErrorCtors.NotLoadedError, commandSelectorTimeout);
            })
            .then(childDriverLink => {
                childDriverLink.availabilityTimeout = commandSelectorTimeout;
                this.activeChildIframeDriverLink          = childDriverLink;
                this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, selector);
            });
    }

    _createWaitForEventPromise (eventName, timeout) {
        let eventHandler = null;

        const timeoutPromise = new Promise(resolve => {
            nativeMethods.setTimeout.call(window, () => {
                this.off(eventName, eventHandler);

                resolve();
            }, timeout);
        });

        const resultPromise = new Promise(resolve => {
            eventHandler = function () {
                this.off(eventName, eventHandler);

                resolve();
            };

            this.on(eventName, eventHandler);
        });

        return Promise.race([timeoutPromise, resultPromise]);
    }

    _waitForCurrentCommandCompletion () {
        if (!this.contextStorage.getItem(this.COMMAND_EXECUTING_FLAG))
            return Promise.resolve();

        return this._createWaitForEventPromise(STATUS_WITH_COMMAND_RESULT_EVENT, COMMAND_EXECUTION_MAX_TIMEOUT);
    }

    _waitForEmptyCommand () {
        return this._createWaitForEventPromise(EMPTY_COMMAND_EVENT, EMPTY_COMMAND_EVENT_WAIT_TIMEOUT);
    }

    _abortSwitchingToChildWindowIfItClosed () {
        if (!this.activeChildWindowDriverLink.driverWindow.closed)
            return;

        arrayUtils.remove(this.childWindowDriverLinks, this.activeChildWindowDriverLink);
        this.activeChildWindowDriverLink = null;

        throw new ChildWindowClosedBeforeSwitchingError();
    }

    _switchToChildWindow (selector) {
        this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, true);

        return executeChildWindowDriverLinkSelector(selector, this.childWindowDriverLinks)
            .then(childWindowDriverLink => {
                return this._ensureChildWindowDriverLink(childWindowDriverLink.driverWindow, ChildWindowIsNotLoadedError, this.childWindowReadyTimeout);
            })
            .then(childWindowDriverLink => {
                this.activeChildWindowDriverLink = childWindowDriverLink;

                return this._waitForCurrentCommandCompletion();
            })
            .then(() => {
                return this._waitForEmptyCommand();
            })
            .then(() => {
                this._abortSwitchingToChildWindowIfItClosed();
                this._stopInternal();

                return this.activeChildWindowDriverLink.setAsMaster();
            })
            .then(() => {
                this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);
            })
            .catch(err => {
                this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);

                if (err instanceof ChildWindowClosedBeforeSwitchingError) {
                    this._onReady(new DriverStatus());

                    return;
                }

                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError()
                }));
            });
    }

    _switchToTopParentWindow () {
        const switchFn = this.parentWindowDriverLink.setTopOpenedWindowAsMaster.bind(this.parentWindowDriverLink);

        this._switchToParentWindowInternal(switchFn);
    }

    _switchToParentWindow () {
        const switchFn = this.parentWindowDriverLink.setParentWindowAsMaster.bind(this.parentWindowDriverLink);

        this._switchToParentWindowInternal(switchFn);
    }

    _switchToParentWindowInternal (parentWindowSwitchFn) {
        this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, true);

        return Promise.resolve()
            .then(() => {
                this._stopInternal();

                return parentWindowSwitchFn();
            })
            .then(() => {
                this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);
            })
            .catch(() => {
                this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);

                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError()
                }));
            });
    }

    _switchToMainWindow (command) {
        if (this.activeChildIframeDriverLink)
            this.activeChildIframeDriverLink.executeCommand(command);

        this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, null);
        this.activeChildIframeDriverLink = null;
    }

    _setNativeDialogHandlerInIframes (dialogHandler) {
        const msg = new SetNativeDialogHandlerMessage(dialogHandler);

        for (let i = 0; i < this.childIframeDriverLinks.length; i++)
            messageSandbox.sendServiceMsg(msg, this.childIframeDriverLinks[i].driverWindow);
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

    _closeAllChildWindows () {
        if (!this.childWindowDriverLinks.length)
            return Promise.resolve();

        return Promise.all(this.childWindowDriverLinks.map(childWindowDriverLink => {
            return childWindowDriverLink.closeAllChildWindows();
        }))
            .then(() => {
                nativeMethods.arrayForEach.call(this.childWindowDriverLinks, childWindowDriverLink => {
                    childWindowDriverLink.driverWindow.close();
                });
            });
    }

    _onTestDone (status) {
        this.contextStorage.setItem(TEST_DONE_SENT_FLAG, true);

        if (this.parentWindowDriverLink)
            this._switchToTopParentWindow();
        else {
            this._closeAllChildWindows()
                .then(() => {
                    return this._sendStatus(status);
                })
                .then(() => {
                    this._checkStatus();
                })
                .catch(() => {
                    this._onReady(new DriverStatus({
                        isCommandResult: true,
                        executionError:  CloseChildWindowError
                    }));
                });
        }
    }

    _onBackupStoragesCommand () {
        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          storages.backup()
        }));
    }

    _isStatusWithCommandResultInPendingWindowSwitchingMode (status) {
        return status.isCommandResult && !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
    }

    _isEmptyCommandInPendingWindowSwitchingMode (command) {
        return !command && !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
    }

    // Routing
    _onReady (status) {
        if (this._isStatusWithCommandResultInPendingWindowSwitchingMode(status))
            this.emit(STATUS_WITH_COMMAND_RESULT_EVENT);

        this._sendStatus(status)
            .then(command => {
                if (command)
                    this._onCommand(command);

                else {
                    if (this._isEmptyCommandInPendingWindowSwitchingMode(command)) {
                        this.emit(EMPTY_COMMAND_EVENT);

                        return;
                    }

                    // NOTE: the driver gets an empty response if TestRun doesn't get a new command within 2 minutes
                    this._onReady(new DriverStatus());
                }
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

        return command.forceExecutionInTopWindowOnly || customCommandHandler && customCommandHandler.isExecutableInTopWindowOnly;
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
                const isThereActiveIframe = this.activeChildIframeDriverLink ||
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

    _startInternal (opts) {
        this.role = DriverRole.master;

        browser.startHeartbeat(this.heartbeatUrl, hammerhead.createNativeXHR);
        this._setupAssertionRetryIndication();
        this._startCommandsProcessing(opts);
    }

    _stopInternal () {
        this.role = DriverRole.replica;

        browser.stopHeartbeat();
        cursor.hide();
    }

    _setupAssertionRetryIndication () {
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

    }

    _startCommandsProcessing (opts = { finalizePendingCommand: false, isFirstRequestAfterWindowSwitching: false }) {
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

        const finalizePendingCommand = opts.finalizePendingCommand || this._hasPendingActionFlags(this.contextStorage);

        const status = pendingStatus || new DriverStatus({
            isCommandResult:                    finalizePendingCommand,
            isFirstRequestAfterWindowSwitching: opts.isFirstRequestAfterWindowSwitching
        });

        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
        this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);

        this._onReady(status);
    }

    _initParentWindowLink () {
        if (window.opener)
            this.parentWindowDriverLink = new ParentWindowDriverLink(window);
    }

    _initConsoleMessages () {
        const messages = this.consoleMessages;

        messages.ensureMessageContainer(this.windowId);

        this.consoleMessages = messages;
    }

    _getDriverRole () {
        if (!this.windowId)
            return Promise.resolve(DriverRole.master);

        return browser
            .getActiveWindowId(this.browserActiveWindowId, hammerhead.createNativeXHR)
            .then(({ activeWindowId }) => {
                return activeWindowId === this.windowId ?
                    DriverRole.master :
                    DriverRole.replica;
            });
    }

    _init () {
        this.contextStorage       = new ContextStorage(window, this.testRunId, this.windowId);
        this.nativeDialogsTracker = new NativeDialogTracker(this.contextStorage, this.dialogHandler);
        this.statusBar            = new StatusBar(this.userAgent, this.fixtureName, this.testName, this.contextStorage);

        this.statusBar.on(this.statusBar.UNLOCK_PAGE_BTN_CLICK, disableRealEventsPreventing);

        this.speed = this.initialSpeed;

        this._initConsoleMessages();
    }

    _doFirstPageLoadSetup () {
        if (this.isFirstPageLoad && this.canUseDefaultWindowActions) {
            // Stub: perform initial setup of the test first page

            return Promise.resolve();
        }

        return Promise.resolve();
    }

    start () {
        this._init();

        this._doFirstPageLoadSetup()
            .then(() => this._getDriverRole())
            .then(role => {
                if (role === DriverRole.master)
                    this._startInternal();
                else
                    this._initParentWindowLink();
            });
    }
}
