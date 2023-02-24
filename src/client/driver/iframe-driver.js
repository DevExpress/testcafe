import {
    Promise,
    eventSandbox,
    utils,
} from './deps/hammerhead';

import { pageUnloadBarrier } from './deps/testcafe-core';
import { IframeStatusBar } from './deps/testcafe-ui';
import Driver from './driver';
import ContextStorage from './storage';
import DriverStatus from './status';
import ParentIframeDriverLink from './driver-link/iframe/parent';
import IframeNativeDialogTracker from './native-dialog-tracker/iframe';

import {
    ChildWindowIsOpenedInFrameMessage,
    StopInternalFromFrameMessage,
    TYPE as MESSAGE_TYPE,
} from './driver-link/messages';
import AxisValues from '../core/utils/values/axis-values';

const messageSandbox = eventSandbox.message;

export default class IframeDriver extends Driver {
    constructor (testRunId, options) {
        super(testRunId, {}, {}, options);

        this.lastParentDriverMessageId = null;
        this.parentDriverLink          = new ParentIframeDriverLink(window.parent);

        this._initParentDriverListening();

        this.leftTopPoint = new AxisValues(0, 0);
    }

    // Errors handling
    _onJsError () {
        // NOTE: do nothing because hammerhead sends js error to the top window directly
    }

    _onConsoleMessage () {
        // NOTE: do nothing because hammerhead sends console messages to the top window directly
    }

    // NOTE: when the new page is opened in the iframe we send a message to the top window
    // to start waiting for the new page is loaded
    _onChildWindowOpened () {
        messageSandbox.sendServiceMsg(new ChildWindowIsOpenedInFrameMessage(), window.top);
    }

    _stopInternal () {
        messageSandbox.sendServiceMsg(new StopInternalFromFrameMessage(), window.top);
    }

    // Messaging between drivers
    _initParentDriverListening () {
        eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, e => {
            const msg = e.message;

            pageUnloadBarrier
                .wait(0)
                .then(() => {
                    // NOTE: the parent driver repeats commands sent to a child driver if it doesn't get a confirmation
                    // from the child in time. However, confirmations sent by child drivers may be delayed when the browser
                    // is heavily loaded. That's why the child driver should ignore repeated messages from its parent.
                    if (msg.type === MESSAGE_TYPE.executeCommand) {
                        if (this.lastParentDriverMessageId === msg.id)
                            return;

                        this.lastParentDriverMessageId = msg.id;

                        this.readyPromise.then(() => {
                            this.speed        = msg.testSpeed;
                            this.leftTopPoint = msg.leftTopPoint;

                            this.parentDriverLink.sendConfirmationMessage(msg.id);
                            this._onCommand(msg.command);
                        });
                    }

                    if (msg.type === MESSAGE_TYPE.setNativeDialogHandler) {
                        this.nativeDialogsTracker.setHandler(msg.dialogHandler);
                        this._setNativeDialogHandlerInIframes(msg.dialogHandler);
                    }
                });
        });
    }

    // Commands handling
    _onSwitchToMainWindowCommand (command) {
        this._switchToMainWindow(command);
    }


    // Routing
    _onReady (status) {
        this.parentDriverLink.onCommandExecuted(status);
    }

    async _isInCommandExecution () {
        if (utils.dom.isCrossDomainWindows(window, window.parent))
            return await this.parentDriverLink.hasPendingActionFlags();

        return this._hasPendingActionFlags(this.contextStorage);
    }

    async _init () {
        const { id, dispatchProxylessEventUrls } = await this.parentDriverLink.establishConnection();

        this.contextStorage = new ContextStorage(window, {
            testRunId: id,
            windowId:  this.windowId,
            proxyless: this.options.proxyless,
        });

        this.communicationUrls.dispatchProxylessEvent         = dispatchProxylessEventUrls.single;
        this.communicationUrls.dispatchProxylessEventSequence = dispatchProxylessEventUrls.sequence;

        if (this._failIfClientCodeExecutionIsInterrupted())
            return;

        const inCommandExecution = await this._isInCommandExecution();

        if (!inCommandExecution)
            return;

        this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
        this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);

        this._onReady(new DriverStatus({ isCommandResult: true }));
    }

    // API
    start () {
        this.nativeDialogsTracker = new IframeNativeDialogTracker({
            dialogHandler: this.options.dialogHandler,
            proxyless:     this.options.proxyless,
        });

        this.statusBar = new IframeStatusBar();

        const initializePromise = this._init();

        this.readyPromise = Promise.all([this.readyPromise, initializePromise]);
    }
}
