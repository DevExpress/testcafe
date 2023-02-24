import hammerhead from './deps/hammerhead';
import {
    RequestBarrier,
    ScriptExecutionEmitter,
    ClientRequestEmitter,
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
    browser,
    TEST_RUN_ERRORS,
} from './deps/testcafe-core';

import { cursor } from './deps/testcafe-automation';

import testCafeUI from './deps/testcafe-ui';

import {
    CHECK_IFRAME_DRIVER_LINK_DELAY,
    SEND_STATUS_REQUEST_TIME_LIMIT,
    SEND_STATUS_REQUEST_RETRY_DELAY,
    SEND_STATUS_REQUEST_RETRY_COUNT,
    CHECK_STATUS_RETRY_DELAY,
    CHECK_CHILD_WINDOW_DRIVER_LINK_DELAY,
} from '../../utils/browser-connection-timeouts';

import TEST_RUN_MESSAGES from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import {
    isBrowserManipulationCommand,
    isCommandRejectableByPageError,
    isExecutableInTopWindowOnly,
} from '../../test-run/commands/utils';

import STATUS_BAR_DEBUG_ACTION from '../../utils/debug-action';

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
    UncaughtErrorInCustomClientScriptCode,
    UncaughtErrorInCustomClientScriptLoadedFromModule,
    ChildWindowIsNotLoadedError,
    CannotSwitchToWindowError,
    CloseChildWindowError,
    ChildWindowClosedBeforeSwitchingError,
    ParentWindowNotFoundError,
    PreviousWindowNotFoundError,
    CannotCloseWindowWithChildrenError,
    CannotCloseWindowWithoutParentError,
    WindowNotFoundError,
    CannotRestoreChildWindowError,
} from '../../shared/errors';


import BrowserConsoleMessages from './client-browser-console-messages';
import NativeDialogTracker from './native-dialog-tracker';

import {
    SwitchToWindowValidationMessage,
    CloseWindowValidationMessage,
    CloseWindowCommandMessage,
    SwitchToWindowCommandMessage,
    SetNativeDialogHandlerMessage,
    GetWindowsMessage,
    ChildWindowIsLoadedInFrameMessage,
    TYPE as MESSAGE_TYPE,
} from './driver-link/messages';

import ContextStorage from './storage';
import DriverStatus from './status';
import generateId from './generate-id';
import ChildIframeDriverLink from './driver-link/iframe/child';

import createReplicator from './command-executors/client-functions/replicator/index';
import SelectorNodeTransform from './command-executors/client-functions/replicator/transforms/selector-node-transform';
import ActionExecutor from './command-executors/action-executor';
import executeManipulationCommand from './command-executors/browser-manipulation';
import executeNavigateToCommand from './command-executors/execute-navigate-to';
import {
    getResult as getExecuteSelectorResult,
    getResultDriverStatus as getExecuteSelectorResultDriverStatus,
} from './command-executors/execute-selector';

import executeChildWindowDriverLinkSelector from './command-executors/execute-child-window-driver-link-selector';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import ChildWindowDriverLink from './driver-link/window/child';
import ParentWindowDriverLink from './driver-link/window/parent';
import sendConfirmationMessage from './driver-link/send-confirmation-message';
import DriverRole from './role';
import {
    CHECK_CHILD_WINDOW_CLOSED_INTERVAL,
    WAIT_FOR_IFRAME_DRIVER_RESPONSE_TIMEOUT,
    WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT,
} from './driver-link/timeouts';
import sendMessageToDriver from './driver-link/send-message-to-driver';
import getExecutorResultDriverStatus from './command-executors/get-executor-result-driver-status';
import SelectorExecutor from './command-executors/client-functions/selector-executor';
import SelectorElementActionTransform from './command-executors/client-functions/replicator/transforms/selector-element-action-transform';
import BarriersComplex from './barriers/complex-barrier';
import createErrorCtorCallback, {
    getCannotObtainInfoErrorCtor,
    getInvisibleErrorCtor,
    getNotFoundErrorCtor,
} from '../../shared/errors/selector-error-ctor-callback';
import './command-executors/action-executor/actions-initializer';
import { shouldSkipJsError } from './process-skip-js-errors';
import isFileProtocol from '../../shared/utils/is-file-protocol';


const settings       = hammerhead.settings;
const transport      = hammerhead.transport;
const Promise        = hammerhead.Promise;
const messageSandbox = hammerhead.eventSandbox.message;
const storages       = hammerhead.storages;
const nativeMethods  = hammerhead.nativeMethods;
const DateCtor       = nativeMethods.date;
const listeners      = hammerhead.eventSandbox.listeners;
const urlUtils       = hammerhead.utils.url;

const TEST_DONE_SENT_FLAG                    = 'testcafe|driver|test-done-sent-flag';
const PENDING_STATUS                         = 'testcafe|driver|pending-status';
const EXECUTING_CLIENT_FUNCTION_DESCRIPTOR   = 'testcafe|driver|executing-client-function-descriptor';
const EXECUTING_SKIP_JS_ERRORS_FUNCTION_FLAG = 'testcafe|driver|executing-skip-js-errors-function-flag';
const SELECTOR_EXECUTION_START_TIME          = 'testcafe|driver|selector-execution-start-time';
const PENDING_PAGE_ERROR                     = 'testcafe|driver|pending-page-error';
const ACTIVE_IFRAME_SELECTOR                 = 'testcafe|driver|active-iframe-selector';
const TEST_SPEED                             = 'testcafe|driver|test-speed';
const ASSERTION_RETRIES_TIMEOUT              = 'testcafe|driver|assertion-retries-timeout';
const ASSERTION_RETRIES_START_TIME           = 'testcafe|driver|assertion-retries-start-time';
const CONSOLE_MESSAGES                       = 'testcafe|driver|console-messages';
const PENDING_CHILD_WINDOW_COUNT             = 'testcafe|driver|pending-child-window-count';

const ACTION_IFRAME_ERROR_CTORS = {
    NotLoadedError:   ActionIframeIsNotLoadedError,
    NotFoundError:    ActionElementNotFoundError,
    IsInvisibleError: ActionElementIsInvisibleError,
};

const CURRENT_IFRAME_ERROR_CTORS = {
    NotLoadedError:   CurrentIframeIsNotLoadedError,
    NotFoundError:    CurrentIframeNotFoundError,
    IsInvisibleError: CurrentIframeIsInvisibleError,
};

const COMMAND_EXECUTION_MAX_TIMEOUT     = Math.pow(2, 31) - 1;
const EMPTY_COMMAND_EVENT_WAIT_TIMEOUT  = 30 * 1000;
const CHILD_WINDOW_CLOSED_EVENT_TIMEOUT = 2000;
const RESTORE_CHILD_WINDOWS_TIMEOUT     = 30 * 1000;

const STATUS_WITH_COMMAND_RESULT_EVENT                 = 'status-with-command-result-event';
const EMPTY_COMMAND_EVENT                              = 'empty-command-event';
const CHILD_WINDOW_CLOSED_EVENT                        = 'child-window-closed';
const SKIP_JS_ERRORS_FUNCTION_EXECUTION_COMPLETE_EVENT = 'skip-js-errors-function-execution-complete';

export default class Driver extends serviceUtils.EventEmitter {
    constructor (testRunId, communicationUrls, runInfo, options) {
        super();

        this.COMMAND_EXECUTING_FLAG        = 'testcafe|driver|command-executing-flag';
        this.EXECUTING_IN_IFRAME_FLAG      = 'testcafe|driver|executing-in-iframe-flag';
        this.PENDING_WINDOW_SWITCHING_FLAG = 'testcafe|driver|pending-window-switching-flag';
        this.WINDOW_COMMAND_API_CALL_FLAG  = 'testcafe|driver|window-command-api-flag';

        this.testRunId         = testRunId;
        this.communicationUrls = communicationUrls;
        this.runInfo           = runInfo;
        this.options           = options;
        this.isFirstPageLoad   = settings.get().isFirstPageLoad;

        this.customCommandHandlers = {};

        this.contextStorage       = null;
        this.nativeDialogsTracker = null;

        this.childIframeDriverLinks      = [];
        this.activeChildIframeDriverLink = null;

        this.childWindowDriverLinks = [];
        this.parentWindowDriverLink = null;

        this.statusBar              = null;
        this.selectorInspectorPanel = null;

        this.windowId                         = this._getCurrentWindowId();
        this.role                             = DriverRole.replica;
        this.setAsMasterInProgress            = false;
        this.checkClosedChildWindowIntervalId = null;

        const requestEmitter = new ClientRequestEmitter();

        this.pageInitialRequestBarrier = new RequestBarrier(requestEmitter);

        this.readyPromise = this._getReadyPromise();

        this._initChildDriverListening();

        pageUnloadBarrier.init();

        if (!this.options.proxyless)
            preventRealEvents();

        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));
        hammerhead.on(hammerhead.EVENTS.unhandledRejection, err => this._onJsError(err));
        hammerhead.on(hammerhead.EVENTS.consoleMethCalled, e => this._onConsoleMessage(e));
        hammerhead.on(hammerhead.EVENTS.beforeFormSubmit, e => this._onFormSubmit(e));
        hammerhead.on(hammerhead.EVENTS.windowOpened, e => this._onChildWindowOpened(e));

        this.setCustomCommandHandlers(COMMAND_TYPE.unlockPage, () => this._unlockPageAfterTestIsDone());
        this.setCustomCommandHandlers(COMMAND_TYPE.getActiveElement, () => this._getActiveElement());

        // NOTE: initiate the child links restoring process before the window is reloaded
        listeners.addInternalEventBeforeListener(window, ['beforeunload'], () => {
            this._sendStartToRestoreCommand();
        });

        this.replicator = createReplicator([ new SelectorNodeTransform() ]);
    }

    _isOpenedInIframe () {
        const opener = window.opener;

        return opener && opener.top && opener.top !== opener;
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
        this.contextStorage.setItem(CONSOLE_MESSAGES, messages ? messages.getCopy() : null);
    }

    async _getReadyPromise () {
        await eventUtils.documentReady(this.options.pageLoadTimeout);

        await this.pageInitialRequestBarrier.wait(true);
    }

    _hasPendingActionFlags (contextStorage) {
        return contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
               contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);
    }

    _getCurrentWindowId () {
        if (this.options.proxyless)
            return this.runInfo.activeWindowId;

        const currentUrl     = window.location.toString();
        const parsedProxyUrl = hammerhead.utils.url.parseProxyUrl(currentUrl);

        return parsedProxyUrl && parsedProxyUrl.windowId || null;
    }

    // Error handling
    async _onJsError (err) {
        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
            return;

        if (this.options.skipJsErrors) {
            this.contextStorage.setItem(EXECUTING_SKIP_JS_ERRORS_FUNCTION_FLAG, true);

            try {
                if (!await shouldSkipJsError(this.options.skipJsErrors, err))
                    this._setUncaughtErrorOnPage(err);
            }
            catch (e) {
                if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
                    this.contextStorage.setItem(PENDING_PAGE_ERROR, e);
            }
            finally {
                this.contextStorage.setItem(EXECUTING_SKIP_JS_ERRORS_FUNCTION_FLAG, false);
                this.emit(SKIP_JS_ERRORS_FUNCTION_EXECUTION_COMPLETE_EVENT);
            }

            return;
        }

        this._setUncaughtErrorOnPage(err);
    }

    _setUncaughtErrorOnPage (err) {
        const error = new UncaughtErrorOnPage(err.stack, err.pageUrl);

        if (!this.contextStorage.getItem(PENDING_PAGE_ERROR))
            this.contextStorage.setItem(PENDING_PAGE_ERROR, error);
    }

    _unlockPageAfterTestIsDone () {
        if (!this.options.proxyless)
            disableRealEventsPreventing();

        return Promise.resolve();
    }

    async _getActiveElement () {
        const activeElement = domUtils.getActiveElement();

        return this.replicator.encode(activeElement);
    }

    _failIfClientCodeExecutionIsInterrupted () {
        // NOTE: ClientFunction should be used primarily for observation. We raise
        // an error if the page was reloaded during ClientFunction execution.
        const executingClientFnDescriptor = this.contextStorage.getItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR);

        if (executingClientFnDescriptor) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new ClientFunctionExecutionInterruptionError(executingClientFnDescriptor.instantiationCallsiteName),
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

            this.emit(CHILD_WINDOW_CLOSED_EVENT);

            arrayUtils.remove(this.childWindowDriverLinks, firstClosedChildWindowDriverLink);

            if (!firstClosedChildWindowDriverLink.ignoreMasterSwitching)
                this._setCurrentWindowAsMaster();

            if (!this.childWindowDriverLinks.length) {
                nativeMethods.clearInterval.call(window, this.checkClosedChildWindowIntervalId);

                delete this.checkClosedChildWindowIntervalId;
            }
        }, CHECK_CHILD_WINDOW_CLOSED_INTERVAL);
    }

    _setAsMasterInProgressOrCompleted () {
        return this.setAsMasterInProgress || this.role === DriverRole.master;
    }

    _setCurrentWindowAsMaster () {
        if (this._setAsMasterInProgressOrCompleted())
            return;

        this.setAsMasterInProgress = true;

        this._clearActiveChildIframeInfo();

        Promise.resolve()
            .then(() => {
                return browser.setActiveWindowId(this.communicationUrls.activeWindowId, hammerhead.createNativeXHR, this.windowId);
            })
            .then(() => {
                this._startInternal({
                    finalizePendingCommand:             true,
                    isFirstRequestAfterWindowSwitching: true,
                });

                this.setAsMasterInProgress = false;
            })
            .catch(() => {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError(),
                }));
            });
    }

    _onChildWindowOpened (e) {
        this._addChildWindowDriverLink(e);
        this._switchToChildWindow(e.windowId);
    }

    _sendStartToRestoreCommand () {
        if (!this.contextStorage)
            return;

        // NOTE: the situation is possible when the child window responds before the parent window is reloaded,
        // so we should not respond to the child window if the parent window is not reloaded
        this._stopRespondToChildren = true;

        // NOTE: save the child window count that we expect to restore after the parent window is reloaded
        this.contextStorage.setItem(PENDING_CHILD_WINDOW_COUNT, this.childWindowDriverLinks.length);

        for (const childLink of this.childWindowDriverLinks)
            childLink.startToRestore();
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
        status.isPendingWindowSwitching = this._isPendingSwitchingWindow();
    }

    _sendStatusRequest (status) {
        const statusRequestOptions = {
            cmd:              TEST_RUN_MESSAGES.ready,
            status:           status,
            disableResending: true,
            allowRejecting:   true,
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

            childIframeDriverLink = new ChildIframeDriverLink(driverWindow, driverId, {
                single:   this.communicationUrls.dispatchProxylessEvent,
                sequence: this.communicationUrls.dispatchProxylessEventSequence,
            });

            this.childIframeDriverLinks.push(childIframeDriverLink);
        }

        childIframeDriverLink.sendConfirmationMessage(id);
    }

    _getTargetWindowNotFoundResult (errCode, errMsg) {
        return Promise.resolve({
            success: false,
            errCode,
            errMsg,
        });
    }

    _getChildWindowValidateResult (arr) {
        const success = arr.find(item => item.result.success);

        if (success)
            return success.result;

        let errItem = arr.find(item => {
            return item.result.errCode === TEST_RUN_ERRORS.cannotCloseWindowWithChildrenError ||
                   item.result.errCode === TEST_RUN_ERRORS.cannotCloseWindowWithoutParent;
        });

        if (!errItem)
            errItem = arr.find(item => !!item.result.errCode);

        return errItem ? { errCode: errItem.result.errCode } : void 0;
    }

    async _handleWindowValidation (msg, wnd, getWindowFoundResult, WindowValidationMessageCtor) {
        const result = await this._validateWindow(msg, wnd, getWindowFoundResult, WindowValidationMessageCtor);

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
            result,
        });
    }

    _getWindowInfo () {
        const parsedUrl = hammerhead.utils.url.parseProxyUrl(window.location.toString());

        return {
            id:    this.windowId,
            title: document.title,
            url:   parsedUrl.destUrl,
        };
    }

    _isTargetWindow (msg) {
        return msg.windowId === this.windowId;
    }

    async _validateWindow (msg, wnd, getWindowFoundResult, WindowValidationMessageCtor) {
        const windowExists = this._isTargetWindow(msg);

        if (windowExists)
            return getWindowFoundResult();

        if (!this.childWindowDriverLinks.length)
            return this._getTargetWindowNotFoundResult(TEST_RUN_ERRORS.targetWindowNotFoundError);

        const searchQueries = this.childWindowDriverLinks.map(childWindowDriverLink => {
            return childWindowDriverLink.findChildWindows(msg, WindowValidationMessageCtor);
        });

        const searchResults = await Promise.all(searchQueries);

        return this._getChildWindowValidateResult(searchResults);
    }

    static _createWindowValidationError ({ errCode }) {
        if (errCode === TEST_RUN_ERRORS.cannotCloseWindowWithChildrenError)
            return new CannotCloseWindowWithChildrenError();

        if (errCode === TEST_RUN_ERRORS.cannotCloseWindowWithoutParent)
            return new CannotCloseWindowWithoutParentError();

        return new WindowNotFoundError();
    }

    _getCloseWindowFoundResult () {
        if (!this.parentWindowDriverLink) {
            return Promise.resolve({
                success: false,
                errCode: TEST_RUN_ERRORS.cannotCloseWindowWithoutParent,
            });
        }

        if (this.childWindowDriverLinks.length) {
            return Promise.resolve({
                success: false,
                errCode: TEST_RUN_ERRORS.cannotCloseWindowWithChildrenError,
            });
        }

        return Promise.resolve({ success: true });
    }

    _handleCloseWindowValidation (msg, wnd) {
        const getWindowFoundResult = () => {
            return this._getCloseWindowFoundResult();
        };

        return this._handleWindowValidation(msg, wnd, getWindowFoundResult, CloseWindowValidationMessage);
    }

    _handleSwitchToWindowValidation (msg, wnd) {
        const getWindowFoundResult = () => {
            return Promise.resolve({ success: true });
        };

        return this._handleWindowValidation(msg, wnd, getWindowFoundResult, SwitchToWindowValidationMessage);
    }

    async _handleCloseWindow (msg, wnd) {
        await this._closeWindow(msg, wnd);

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
        });
    }

    async _closeWindowAndWait (childWindowToClose, msg) {
        const waitWindowForClose = this._createWaitForEventPromise(CHILD_WINDOW_CLOSED_EVENT, CHILD_WINDOW_CLOSED_EVENT_TIMEOUT);

        childWindowToClose.ignoreMasterSwitching = !msg.isCurrentWindow;

        if (!this.closing) {
            this.closing = true;

            await browser.closeWindow(this.communicationUrls.closeWindow, hammerhead.createNativeXHR, this.windowId);
        }

        childWindowToClose.driverWindow.close();

        return waitWindowForClose;
    }

    _closeWindow (msg) {
        if (!this.childWindowDriverLinks.length)
            return Promise.resolve();

        const childWindowToClose = this.childWindowDriverLinks.find(link => link.windowId === msg.windowId);

        if (childWindowToClose)
            return this._closeWindowAndWait(childWindowToClose, msg);

        const searchQueries = this.childWindowDriverLinks.map(childWindowDriverLink => {
            return childWindowDriverLink.findChildWindows(msg, CloseWindowCommandMessage);
        });

        return Promise.all(searchQueries);
    }


    async _getWindows () {
        if (!this.childWindowDriverLinks.length)
            return [this._getWindowInfo()];

        const searchQueries = this.childWindowDriverLinks.map(childWindowDriverLink => {
            return childWindowDriverLink.findChildWindows({}, GetWindowsMessage);
        });

        const searchResults = await Promise.all(searchQueries);
        let result          = [this._getWindowInfo()];

        for (const item of searchResults) {
            if (Array.isArray(item.result))
                result = result.concat(item.result);
        }

        return result;
    }

    async _handleGetWindows (msg, wnd) {
        const result = await this._getWindows(msg, wnd);

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
            result,
        });
    }

    async _handleSwitchToWindow (msg, wnd) {
        await this._switchToWindow(msg);

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
        });
    }

    _switchToWindow (msg) {
        if (this._isTargetWindow(msg)) {
            return Promise.resolve()
                .then(() => {
                    this._setCurrentWindowAsMaster();
                });
        }

        if (!this.childWindowDriverLinks.length)
            return Promise.resolve();

        return Promise.all(this.childWindowDriverLinks.map(childWindowDriverLink => {
            return childWindowDriverLink.findChildWindows(msg, SwitchToWindowCommandMessage);
        }));
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
            window:       wnd,
        });

        Promise.resolve()
            .then(() => {
                return browser.setActiveWindowId(this.communicationUrls.activeWindowId, hammerhead.createNativeXHR, this.windowId);
            })
            .then(() => {
                this._startInternal({
                    finalizePendingCommand: msg.finalizePendingCommand,
                    result:                 { id: this.windowId },
                });

                this.setAsMasterInProgress = false;
            })
            .catch(() => {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError(),
                }));
            });
    }

    _handleCloseAllWindowsMessage (msg, wnd) {
        this._closeAllChildWindows()
            .then(() => {
                sendConfirmationMessage({
                    requestMsgId: msg.id,
                    window:       wnd,
                });
            })
            .catch(() => {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CloseChildWindowError(),
                }));
            });
    }

    _handleStartToRestoreChildLinkMessage () {
        this.parentWindowDriverLink.restoreChild(this._getCurrentWindowId());
    }

    _handleHasPendingActionFlags (msg, window) {
        const result = this._hasPendingActionFlags(this.contextStorage);

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window,
            result,
        });
    }

    _handleRestoreChildLink (msg, wnd) {
        if (this._stopRespondToChildren)
            return;

        this._addChildWindowDriverLink({ window: wnd, windowId: msg.windowId });

        const allChildWindowLinksRestored = this.childWindowDriverLinks.length === this.contextStorage.getItem(PENDING_CHILD_WINDOW_COUNT);

        if (allChildWindowLinksRestored && this._restoreChildWindowsPromiseResolver) {
            this._restoreChildWindowsPromiseResolver();

            delete this._restoreChildWindowsPromiseResolver;

            this.contextStorage.setItem(PENDING_CHILD_WINDOW_COUNT, 0);
        }

        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
        });
    }

    _handleChildWindowIsOpenedInIFrame () {
        // NOTE: when the child window is opened in iframe we need to wait until the
        // child window is fully loaded
        this._pendingChildWindowInIFrame = new Promise(resolve => {
            this._resolvePendingChildWindowInIframe = resolve;
        });
    }

    _handleChildWindowIsLoadedInIFrame (msg, wnd) {
        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
        });

        this._resolvePendingChildWindowInIframe();

        const childWindowDriverLinkExists = !!this.childWindowDriverLinks.find(link => link.windowId === msg.windowId);

        if (!childWindowDriverLinkExists)
            this._onChildWindowOpened({ window: wnd, windowId: msg.windowId });
    }

    _handleStopInternalFromFrame (msg, wnd) {
        sendConfirmationMessage({
            requestMsgId: msg.id,
            window:       wnd,
        });

        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);

        this._stopInternal();
    }

    _initChildDriverListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            const msg    = e.message;
            const window = e.source;

            switch (msg.type) {
                case MESSAGE_TYPE.establishConnection:
                    this._addChildIframeDriverLink(msg.id, window);
                    break;
                case MESSAGE_TYPE.childWindowIsOpenedInIFrame:
                    this._handleChildWindowIsOpenedInIFrame(msg, window);
                    break;
                case MESSAGE_TYPE.childWindowIsLoadedInIFrame:
                    this._handleChildWindowIsLoadedInIFrame(msg, window);
                    break;
                case MESSAGE_TYPE.stopInternalFromFrame:
                    this._handleStopInternalFromFrame(msg, window);
                    break;
                case MESSAGE_TYPE.setAsMaster:
                    this._handleSetAsMasterMessage(msg, window);
                    break;
                case MESSAGE_TYPE.switchToWindow:
                    this._handleSwitchToWindow(msg, window);
                    break;
                case MESSAGE_TYPE.closeWindow:
                    this._handleCloseWindow(msg, window);
                    break;
                case MESSAGE_TYPE.switchToWindowValidation:
                    this._handleSwitchToWindowValidation(msg, window);
                    break;
                case MESSAGE_TYPE.closeWindowValidation:
                    this._handleCloseWindowValidation(msg, window);
                    break;
                case MESSAGE_TYPE.getWindows:
                    this._handleGetWindows(msg, window);
                    break;
                case MESSAGE_TYPE.closeAllChildWindows:
                    this._handleCloseAllWindowsMessage(msg, window);
                    break;
                case MESSAGE_TYPE.startToRestoreChildLink:
                    this._handleStartToRestoreChildLinkMessage();
                    break;
                case MESSAGE_TYPE.hasPendingActionFlags:
                    this._handleHasPendingActionFlags(msg, window);
                    break;
                case MESSAGE_TYPE.restoreChildLink:
                    this._handleRestoreChildLink(msg, window);
            }
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

                return this.activeChildIframeDriverLink.executeCommand(command, this.speed, this.options.proxyless, this.leftTopPoint);
            })
            .then(status => this._onCommandExecutedInIframe(status))
            .catch(err => this._onCommandExecutedInIframe(new DriverStatus({
                isCommandResult: true,
                executionError:  err,
            })));
    }

    _onCommandExecutedInIframe (status) {
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);

        let promise = Promise.resolve();

        if (this._pendingChildWindowInIFrame)
            promise = this._pendingChildWindowInIFrame;

        promise.then(() => {
            this._onReady(status);
        });
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
        const commandSelectorTimeout = hasSpecificTimeout ? selector.timeout : this.options.selectorTimeout;

        return getExecuteSelectorResult(selector, commandSelectorTimeout, null,
            fn => new iframeErrorCtors.NotFoundError(null, fn), () => new iframeErrorCtors.IsInvisibleError(), this.statusBar)
            .then(iframe => {
                if (!domUtils.isIframeElement(iframe))
                    throw new ActionElementNotIframeError();

                // NOTE: RG-4558 Previously we waited for iframe become visible when execute selector
                // We need to add a timeout to be sure that iframe driver is initialized
                const childLinkResponseTimeout = hasSpecificTimeout
                    ? commandSelectorTimeout
                    : Math.max(commandSelectorTimeout, WAIT_FOR_IFRAME_DRIVER_RESPONSE_TIMEOUT);

                return this._ensureChildIframeDriverLink(nativeMethods.contentWindowGetter.call(iframe),
                    iframeErrorCtors.NotLoadedError, childLinkResponseTimeout);
            })
            .then(childDriverLink => {
                childDriverLink.availabilityTimeout = commandSelectorTimeout;
                this.activeChildIframeDriverLink    = childDriverLink;
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

    _waitForSkipJsErrorFunctionCompletion (driverStatus) {
        if (!this.contextStorage.getItem(EXECUTING_SKIP_JS_ERRORS_FUNCTION_FLAG))
            return Promise.resolve(driverStatus);

        return new Promise(resolve => {
            const eventHandler = () => {
                this.off(SKIP_JS_ERRORS_FUNCTION_EXECUTION_COMPLETE_EVENT, eventHandler);

                resolve(driverStatus);
            };

            this.on(SKIP_JS_ERRORS_FUNCTION_EXECUTION_COMPLETE_EVENT, eventHandler);
        });
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

        const isWindowOpenedViaAPI = this.contextStorage.getItem(this.WINDOW_COMMAND_API_CALL_FLAG);

        return executeChildWindowDriverLinkSelector(selector, this.childWindowDriverLinks)
            .then(childWindowDriverLink => {
                return this._ensureChildWindowDriverLink(childWindowDriverLink.driverWindow, ChildWindowIsNotLoadedError, this.options.childWindowReadyTimeout);
            })
            .then(childWindowDriverLink => {
                this.activeChildWindowDriverLink = childWindowDriverLink;

                return this._waitForCurrentCommandCompletion();
            })
            .then(() => {
                return isWindowOpenedViaAPI ? void 0 : this._waitForEmptyCommand();
            })
            .then(() => {
                this._observeFileDownloadingInNewWindow();
                this._abortSwitchingToChildWindowIfItClosed();
                this._stopInternal();

                return this.activeChildWindowDriverLink.setAsMaster(isWindowOpenedViaAPI);
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
                    executionError:  new CannotSwitchToWindowError(),
                }));
            });
    }

    _switchToTopParentWindow () {
        const switchFn = this.parentWindowDriverLink.setTopOpenedWindowAsMaster.bind(this.parentWindowDriverLink);

        this._switchToParentWindowInternal(switchFn);
    }

    _switchToParentWindow (opts = {}) {
        const switchFn = this.parentWindowDriverLink.setParentWindowAsMaster.bind(this.parentWindowDriverLink);

        this._switchToParentWindowInternal(switchFn, opts);
    }

    _switchToParentWindowInternal (parentWindowSwitchFn, opts = {}) {
        this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, true);

        return Promise.resolve()
            .then(() => {
                this._stopInternal();

                return parentWindowSwitchFn(opts);
            })
            .then(() => {
                this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);
            })
            .catch(() => {
                this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);

                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    executionError:  new CannotSwitchToWindowError(),
                }));
            });
    }

    _switchToMainWindow (command) {
        if (this.activeChildIframeDriverLink)
            this.activeChildIframeDriverLink.executeCommand(command);

        this._clearActiveChildIframeInfo();
    }

    _clearActiveChildIframeInfo () {
        this.contextStorage.setItem(ACTIVE_IFRAME_SELECTOR, null);
        this.activeChildIframeDriverLink = null;
    }

    _setNativeDialogHandlerInIframes (dialogHandler) {
        const msg = new SetNativeDialogHandlerMessage(dialogHandler);

        for (let i = 0; i < this.childIframeDriverLinks.length; i++)
            messageSandbox.sendServiceMsg(msg, this.childIframeDriverLinks[i].driverWindow);
    }

    _createDispatchProxylessEventFn (name) {
        return nativeMethods.functionBind.call(
            browser[name],
            browser[name],
            this.communicationUrls[name],
            testCafeUI,
            hammerhead.createNativeXHR);
    }

    // Commands handling
    _onActionCommand (command) {
        const executeSelectorCb = (selector/*: ExecuteSelectorCommand*/, errCtors/*: AutomationErrorCtors*/, startTime/*: number*/) => {
            const createNotFoundError    = createErrorCtorCallback(errCtors.notFound);
            const createIsInvisibleError = createErrorCtorCallback(errCtors.invisible);
            const selectorExecutor       = new SelectorExecutor(selector, this.options.selectorTimeout,
                startTime, createNotFoundError, createIsInvisibleError);

            return selectorExecutor.getResult();
        };

        const dispatchProxylessEventFn = this.options.proxyless
            ? {
                single:   this._createDispatchProxylessEventFn('dispatchProxylessEvent'),
                sequence: this._createDispatchProxylessEventFn('dispatchProxylessEventSequence'),
            }
            : null;

        const executor = new ActionExecutor(command, {
            globalSelectorTimeout: this.options.selectorTimeout,
            testSpeed:             this.speed,
            executeSelectorFn:     executeSelectorCb,
            leftTopPoint:          this.leftTopPoint,
            dispatchProxylessEventFn,
        });

        const warnings = [];

        executor.on(ActionExecutor.EXECUTION_STARTED_EVENT, () => {
            this.statusBar.hideWaitingElementStatus(true);
            this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);
        });

        executor.on(ActionExecutor.WAITING_FOR_ELEMENT_EVENT, timeout => {
            this.statusBar.showWaitingElementStatus(timeout);
        });

        executor.on(ActionExecutor.WARNING_EVENT, warning => {
            warnings.push(warning);
        });

        const clientRequestEmitter   = new ClientRequestEmitter();
        const scriptExecutionEmitter = new ScriptExecutionEmitter();
        const barriers               = new BarriersComplex(clientRequestEmitter, scriptExecutionEmitter, pageUnloadBarrier);

        executor.execute(barriers)
            .then(elements => new DriverStatus({
                isCommandResult: true,
                result:          createReplicator(new SelectorElementActionTransform()).encode(elements),
                warnings,
            }))
            .catch(err => this.statusBar.hideWaitingElementStatus(false)
                .then(() => new DriverStatus({ isCommandResult: true, executionError: err })),
            )
            .then(driverStatus => this._waitForSkipJsErrorFunctionCompletion(driverStatus))
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
                this.contextStorage.setItem(EXECUTING_SKIP_JS_ERRORS_FUNCTION_FLAG, false);
                this._onReady(driverStatus);
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
            result:          this.nativeDialogsTracker.appearedDialogs,
        }));
    }

    _onGetBrowserConsoleMessagesCommand () {
        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onNavigateToCommand (command) {
        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);

        if (this.options.proxyless && isFileProtocol(command.url))
            browser.redirectUsingCdp(command, hammerhead.createNativeXHR, this.communicationUrls.openFileProtocolUrl);
        else {
            executeNavigateToCommand(command)
                .then(driverStatus => {
                    this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);

                    return this._onReady(driverStatus);
                });
        }
    }

    _onGetProxyUrlCommand (command) {
        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          urlUtils.getProxyUrl(command.url, command.options),
        }));
    }

    _onSkipJsErrorsCommand ({ options }) {
        this.options.skipJsErrors = options;

        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onExecuteClientFunctionCommand (command) {
        this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, { instantiationCallsiteName: command.instantiationCallsiteName });

        const executor = new ClientFunctionExecutor(command);

        getExecutorResultDriverStatus(executor)
            .then(driverStatus => {
                this.contextStorage.setItem(EXECUTING_CLIENT_FUNCTION_DESCRIPTOR, null);
                this._onReady(driverStatus);
            });
    }

    _onExecuteSelectorCommand (command) {
        const startTime                   = this.contextStorage.getItem(SELECTOR_EXECUTION_START_TIME) || new DateCtor();
        const elementNotFoundOrNotVisible = createErrorCtorCallback(getCannotObtainInfoErrorCtor());
        const elementNotFound             = command.strictError ? createErrorCtorCallback(getNotFoundErrorCtor()) : elementNotFoundOrNotVisible;
        const elementIsInvisible          = command.strictError ? createErrorCtorCallback(getInvisibleErrorCtor()) : elementNotFoundOrNotVisible;

        getExecuteSelectorResultDriverStatus(command,
            this.options.selectorTimeout,
            startTime,
            command.needError ? elementNotFound : null,
            command.needError ? elementIsInvisible : null,
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
                executionError:  err,
            })));
    }

    _onWindowOpenCommand (command) {
        this.contextStorage.setItem(this.WINDOW_COMMAND_API_CALL_FLAG, true);

        window.open(command.url);
    }

    async _onWindowCloseCommand (command) {
        const wnd             = this._getTopOpenedWindow();
        const windowId        = command.windowId || this.windowId;
        const isCurrentWindow = windowId === this.windowId;

        try {
            const response = await this._validateChildWindowCloseCommandExists(windowId, wnd);
            const result   = response.result;

            if (!result.success)
                throw Driver._createWindowValidationError(result);

            await sendMessageToDriver(new CloseWindowCommandMessage({
                windowId,
                isCurrentWindow,
            }), wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);

            // NOTE: we do not need to send a new Driver Status if we close the current window
            // in this case the new Driver Status will be sent from the `_setCurrentWindowAsMaster` method
            // in other cases we need to send a new Driver Status from here.

            if (!isCurrentWindow) {
                this._onReady(new DriverStatus({
                    isCommandResult: true,
                }));
            }
        }
        catch (err) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  err,
            }));
        }
    }

    _onGetCurrentWindowCommand () {
        this._onReady(new DriverStatus({
            isCommandResult: true,

            result: {
                id: this.windowId,
            },
        }));
    }

    async _onGetWindowsCommand () {
        const wnd      = this._getTopOpenedWindow();
        const response = await sendMessageToDriver(new GetWindowsMessage(), wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);

        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          response.result,
        }));
    }

    _validateChildWindowCloseCommandExists (windowId, wnd) {
        return sendMessageToDriver(new CloseWindowValidationMessage({ windowId }), wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    _validateChildWindowSwitchToWindowCommandExists ({ windowId, fn }, wnd) {
        return sendMessageToDriver(new SwitchToWindowValidationMessage({ windowId, fn }), wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    _getTopOpenedWindow () {
        const wnd = this.parentWindowDriverLink?.getTopOpenedWindow() || window;

        return wnd.top;
    }

    async _onSwitchToWindow (command, err) {
        const wnd      = this._getTopOpenedWindow();
        const response = await this._validateChildWindowSwitchToWindowCommandExists({ windowId: command.windowId, fn: command.checkWindow }, wnd);
        const result   = response.result;

        if (!result.success) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  err || Driver._createWindowValidationError(result),
            }));
        }
        else {
            this._stopInternal();

            sendMessageToDriver(new SwitchToWindowCommandMessage({ windowId: command.windowId, fn: command.checkWindow }), wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
        }
    }

    async _restoreChildWindowLinks () {
        if (!this.contextStorage.getItem(PENDING_CHILD_WINDOW_COUNT))
            return;

        const restoreChildWindowsPromise = new Promise(resolve => {
            this._restoreChildWindowsPromiseResolver = resolve;
        });

        try {
            await getTimeLimitedPromise(restoreChildWindowsPromise, RESTORE_CHILD_WINDOWS_TIMEOUT);
        }
        catch (err) {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new CannotRestoreChildWindowError(),
            }));
        }
    }

    _onSwitchToPreviousWindow (command) {
        this._onSwitchToWindow(command, new PreviousWindowNotFoundError());
    }

    _onSwitchToParentWindow () {
        if (this.parentWindowDriverLink)
            this._switchToParentWindow({ finalizePendingCommand: true });
        else {
            this._onReady(new DriverStatus({
                isCommandResult: true,
                executionError:  new ParentWindowNotFoundError(),
            }));
        }
    }

    _onBrowserManipulationCommand (command) {
        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, true);

        executeManipulationCommand(command, this.options.selectorTimeout, this.statusBar)
            .then(driverStatus => {
                this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
                return this._onReady(driverStatus);
            });
    }

    _onSetBreakpointCommand ({ isTestError, inCompilerService }) {
        const showDebuggingStatusPromise = this.statusBar.showDebuggingStatus(isTestError);

        this.selectorInspectorPanel.show();

        if (inCompilerService) {
            showDebuggingStatusPromise.then(debug => {
                this.debug = debug;
            });

            this._onReady(new DriverStatus({
                isCommandResult: true,
                result:          true,
            }));
        }
        else {
            showDebuggingStatusPromise.then(debug => {
                const stopAfterNextAction = debug === STATUS_BAR_DEBUG_ACTION.step;

                this._onReady(new DriverStatus({
                    isCommandResult: true,
                    result:          stopAfterNextAction,
                }));
            });
        }
    }

    _onDisableDebugCommand () {
        this.statusBar._resetState();

        this._onReady(new DriverStatus({
            isCommandResult: true,
        }));
    }

    _onSetTestSpeedCommand (command) {
        this.speed = command.speed;

        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    _onShowAssertionRetriesStatusCommand (command) {
        this.contextStorage.setItem(ASSERTION_RETRIES_TIMEOUT, command.timeout);
        this.contextStorage.setItem(ASSERTION_RETRIES_START_TIME, nativeMethods.dateNow());

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
        const urls = {
            statusUrl: this.communicationUrls.statusDone,
        };

        return browser
            .checkStatus(urls, hammerhead.createNativeXHR, { manualRedirect: true, proxyless: this.options.proxyless })
            .then(({ command }) => {
                const isSessionChange = command.testRunId !== this.testRunId;

                if (isSessionChange) {
                    storages.clear();
                    storages.lock();

                    browser.redirect(command, hammerhead.createNativeXHR, this.communicationUrls.openFileProtocolUrl);
                }
                else {
                    this.contextStorage.setItem(TEST_DONE_SENT_FLAG, false);
                    this._onReady({ isCommandResult: false });
                }
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
                        executionError:  CloseChildWindowError,
                    }));
                });
        }
    }

    _onBackupStoragesCommand () {
        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          storages.backup(),
        }));
    }

    _isPendingSwitchingWindow () {
        return !!this.contextStorage.getItem(this.PENDING_WINDOW_SWITCHING_FLAG);
    }

    _onPrepareClientEnvironmentInDebugMode (command) {
        // NOTE: repeat the function call wrapping produced by the 'esm' module on the client-side
        // (same as on the server-side).
        nativeMethods.objectDefineProperty(window, command.esmRuntime, {
            value: {
                g: window,
                c: window.eval, //eslint-disable-line no-eval
            },
            configurable: true, // NOTE: for the 'disablePageReloads' option
        });

        this._onReady(new DriverStatus({
            isCommandResult: true,
            result:          true,
        }));
    }

    _isStatusWithCommandResultInPendingWindowSwitchingMode (status) {
        return status.isCommandResult && this._isPendingSwitchingWindow();
    }

    _isEmptyCommandInPendingWindowSwitchingMode (command) {
        return !command && this._isPendingSwitchingWindow();
    }

    _observeFileDownloadingInNewWindow () {
        const status = new DriverStatus({ isObservingFileDownloadingInNewWindow: true });

        if (this._isPendingSwitchingWindow()) {
            this._sendStatus(status)
                .then(command => {
                    if (command)
                        this._onCommand(command);
                    else
                        this._observeFileDownloadingInNewWindow();
                });
        }
    }

    // Routing
    _onReady (status) {
        if (this.debug) {
            status.debug = this.debug;

            this.debug = null;
        }

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
        this.contextStorage.setItem(this.WINDOW_COMMAND_API_CALL_FLAG, false);

        if (this.selectorInspectorPanel)
            this.selectorInspectorPanel.hide();

        if (this.customCommandHandlers[command.type])
            this._onCustomCommand(command);

        else if (command.type === COMMAND_TYPE.testDone)
            this._onTestDone(new DriverStatus({ isCommandResult: true }));

        else if (command.type === COMMAND_TYPE.setBreakpoint)
            this._onSetBreakpointCommand(command);

        else if (command.type === COMMAND_TYPE.disableDebug)
            this._onDisableDebugCommand();

        else if (command.type === COMMAND_TYPE.switchToMainWindow)
            this._onSwitchToMainWindowCommand(command);

        else if (command.type === COMMAND_TYPE.switchToIframe)
            this._onSwitchToIframeCommand(command);

        else if (command.type === COMMAND_TYPE.openWindow)
            this._onWindowOpenCommand(command);

        else if (command.type === COMMAND_TYPE.closeWindow)
            this._onWindowCloseCommand(command);

        else if (command.type === COMMAND_TYPE.getCurrentWindow)
            this._onGetCurrentWindowCommand(command);

        else if (command.type === COMMAND_TYPE.getCurrentWindows)
            this._onGetWindowsCommand();

        else if (command.type === COMMAND_TYPE.switchToWindow)
            this._onSwitchToWindow(command);

        else if (command.type === COMMAND_TYPE.switchToPreviousWindow)
            this._onSwitchToPreviousWindow(command);

        else if (command.type === COMMAND_TYPE.switchToParentWindow)
            this._onSwitchToParentWindow();

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
        else if (command.type === COMMAND_TYPE.closeChildWindowOnFileDownloading)
            this._closeChildWindowOnFileDownloading();

        else if (command.type === COMMAND_TYPE.prepareClientEnvironmentInDebugMode)
            this._onPrepareClientEnvironmentInDebugMode(command);

        else if (command.type === COMMAND_TYPE.getProxyUrl)
            this._onGetProxyUrlCommand(command);

        else if (command.type === COMMAND_TYPE.skipJsErrors)
            this._onSkipJsErrorsCommand(command);

        else
            this._onActionCommand(command);
    }

    _closeChildWindowOnFileDownloading () {
        this.activeChildWindowDriverLink.closeFileDownloadingWindow();
        arrayUtils.remove(this.childWindowDriverLinks, this.activeChildWindowDriverLink);
        cursor.show();
        this._startInternal();
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
            handler,
        };
    }

    _startInternal (opts) {
        this.role = DriverRole.master;

        browser.startHeartbeat(this.communicationUrls.heartbeat, hammerhead.createNativeXHR);
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
                const timeLeft  = assertionRetriesTimeout - (new DateCtor() - startTime);

                if (timeLeft > 0)
                    this.statusBar.showWaitingAssertionRetriesStatus(assertionRetriesTimeout, startTime);
            }
        });

    }

    _startCommandsProcessing (opts = { finalizePendingCommand: false, isFirstRequestAfterWindowSwitching: false, result: void 0 }) {
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
            isFirstRequestAfterWindowSwitching: opts.isFirstRequestAfterWindowSwitching,
            result:                             opts.result,
        });

        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
        this.contextStorage.setItem(this.PENDING_WINDOW_SWITCHING_FLAG, false);

        this._onReady(status);
    }

    _initParentWindowLink () {
        // NOTE: we need to create parentWindowDriverLinks in the following cases:
        // multiple-windows mode is enabled
        // current window has parent window
        // current window parent is not the same as current window
        // the last case is possible when we have the series of multiple and non-multiple windows tests
        if (window.opener && window.opener !== window && this.windowId)
            this.parentWindowDriverLink = new ParentWindowDriverLink(window);
    }

    _initConsoleMessages () {
        const messages = this.consoleMessages;

        messages.ensureMessageContainer(this.windowId);

        this.consoleMessages = messages;
    }

    async _getDriverRole () {
        if (!this.windowId)
            return DriverRole.master;

        const { activeWindowId } = await browser.getActiveWindowId(this.communicationUrls.activeWindowId, hammerhead.createNativeXHR);

        return activeWindowId === this.windowId ?
            DriverRole.master :
            DriverRole.replica;
    }

    _init () {
        const { proxyless, dialogHandler, speed } = this.options;

        this.contextStorage = new ContextStorage(window, {
            testRunId: this.testRunId,
            windowId:  this.windowId,
            proxyless,
        });

        this.nativeDialogsTracker   = new NativeDialogTracker(this.contextStorage, { proxyless, dialogHandler });
        this.statusBar              = new testCafeUI.StatusBar(this.runInfo.userAgent, this.runInfo.fixtureName, this.runInfo.testName, this.contextStorage);
        this.selectorInspectorPanel = new testCafeUI.SelectorInspectorPanel(this.statusBar);

        const self = this;

        this.statusBar.on(this.statusBar.UNLOCK_PAGE_BTN_CLICK, () => {
            if (!self.options.proxyless)
                disableRealEventsPreventing();
        });

        this.speed = speed;

        this._initConsoleMessages();
        this._initParentWindowLink();

        if (this._isOpenedInIframe())
            sendMessageToDriver(new ChildWindowIsLoadedInFrameMessage(this.windowId), window.opener.top, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, WindowNotFoundError);
    }

    async _doFirstPageLoadSetup () {
        if (this.isFirstPageLoad && this.options.canUseDefaultWindowActions) {
            // Stub: perform initial setup of the test first page
        }
    }

    async start () {
        this._init();

        await this._doFirstPageLoadSetup();
        await this._restoreChildWindowLinks();

        const role = await this._getDriverRole();

        // NOTE: the child window can become master during the preceding async requests
        // in this case we do not need to call the `_startInternal` method again
        // since it was called during the `_handleSetAsMasterMessage` method.
        if (this.role === DriverRole.master)
            return;

        if (role === DriverRole.master)
            this._startInternal();
    }
}
