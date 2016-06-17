import { eventSandbox } from '../deps/hammerhead';
import { EstablishConnectionMessage, CommandExecutedMessage, ConfirmationMessage } from './messages';
import { CurrentIframeIsNotLoadedError } from '../../../errors/test-run';
import sendMessageToDriver from './send-message-to-driver';


const WAIT_FOR_PARENT_DRIVER_RESPONSE_TIMEOUT = 5000;

export default class ParentDriverLink {
    constructor (parentDriverWindow) {
        this.driverWindow = parentDriverWindow;
    }

    establishConnection () {
        var msg = new EstablishConnectionMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_PARENT_DRIVER_RESPONSE_TIMEOUT, CurrentIframeIsNotLoadedError)
            .then(response => response.result.id);
    }

    confirmMessageReceived (requestMsgId) {
        var msg = new ConfirmationMessage(requestMsgId);

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }

    onCommandExecuted (status) {
        var msg = new CommandExecutedMessage(status);

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }
}
