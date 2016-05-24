import { eventSandbox } from './deps/hammerhead';
import Driver from './driver';
import ContextStorage from './storage';
import DriverStatus from './status';
import ParentDriverLink from './driver-link/parent';
import INTER_DRIVER_MESSAGES from './driver-link/messages';


export default class IframeDriver extends Driver {
    constructor (testRunId, elementAvailabilityTimeout) {
        super(testRunId, elementAvailabilityTimeout);

        this.parentDriverLink = new ParentDriverLink(window.parent);
        this._initParentDriverListening();
    }

    // Errors handling
    _onJsError () {
        // NOTE: do nothing because hammerhead sends js error to the top window directly
    }

    // Messaging between drivers
    _initParentDriverListening () {
        eventSandbox.message.on(eventSandbox.message.SERVICE_MSG_RECEIVED_EVENT, e => {
            var msg = e.message;

            if (this.beforeUnloadRaised)
                return;

            if (msg.cmd === INTER_DRIVER_MESSAGES.executeCommand) {
                this.parentDriverLink.confirmMessageReceived(msg);
                this._onCommand(msg.command);
            }
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
        this.parentDriverLink
            .establishConnection()
            .then(id => {
                this.contextStorage = new ContextStorage(window, id);

                if (this._failIfClientCodeExecutionIsInterrupted())
                    return;

                var inCommandExecution = this.contextStorage.getItem(this.COMMAND_EXECUTING_FLAG) ||
                                         this.contextStorage.getItem(this.EXECUTING_IN_IFRAME_FLAG);

                if (inCommandExecution)
                    this._onReady(new DriverStatus({ isCommandResult: true }));
            });
    }
}
