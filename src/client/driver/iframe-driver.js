import { Promise, eventSandbox } from './deps/hammerhead';
import { pageUnloadBarrier } from './deps/testcafe-core';
import { IframeStatusBar } from './deps/testcafe-ui';
import Driver from './driver';
import ContextStorage from './storage';
import DriverStatus from './status';
import ParentDriverLink from './driver-link/parent';
import { TYPE as MESSAGE_TYPE } from './driver-link/messages';
import IframeNativeDialogTracker from './native-dialog-tracker/iframe';


export default class IframeDriver extends Driver {
    constructor (testRunId, options) {
        super(testRunId, {}, {}, options);

        this.lastParentDriverMessageId = null;
        this.parentDriverLink          = new ParentDriverLink(window.parent);
        this._initParentDriverListening();
    }

    // Errors handling
    _onJsError () {
        // NOTE: do nothing because hammerhead sends js error to the top window directly
    }

    _onConsoleMessage () {
        // NOTE: do nothing because hammerhead sends console messages to the top window directly
    }

    // Messaging between drivers
    _initParentDriverListening () {
        eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, e => {
            var msg = e.message;

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
                            this.speed = msg.testSpeed;

                            this.parentDriverLink.confirmMessageReceived(msg.id);
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


    // API
    start () {
        this.nativeDialogsTracker = new IframeNativeDialogTracker(this.dialogHandler);
        this.statusBar            = new IframeStatusBar();

        var initializePromise = this.parentDriverLink
            .establishConnection()
            .then(id => {
                this.contextStorage = new ContextStorage(window, id);

                if (this._failIfClientCodeExecutionIsInterrupted())
                    return;

                var inCommandExecution = this.contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
                                         this.contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);

                if (inCommandExecution) {
                    this.contextStorage.setItem(this.COMMAND_EXECUTING_FLAG, false);
                    this.contextStorage.setItem(this.EXECUTING_IN_IFRAME_FLAG, false);
                    this._onReady(new DriverStatus({ isCommandResult: true }));
                }
            });

        this.readyPromise = Promise.all([this.readyPromise, initializePromise]);
    }
}
