import { eventSandbox } from '../deps/hammerhead';
import {
    EstablishConnectionMessage,
    CommandExecutedMessage,
    ConfirmationMessage
} from './messages';
import { CurrentIframeIsNotLoadedError } from '../../../errors/test-run';
import sendMessageToDriver from './send-message-to-driver';
import { WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT } from './timeouts';

export default class ParentDriverLink {
    constructor (parentDriverWindow) {
        this.driverWindow = parentDriverWindow;
    }

    establishConnection () {
        const msg = new EstablishConnectionMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CurrentIframeIsNotLoadedError)
            .then(response => response.result.id);
    }

    confirmMessageReceived (requestMsgId) {
        const msg = new ConfirmationMessage(requestMsgId);

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }

    onCommandExecuted (status) {
        const msg = new CommandExecutedMessage(status);

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }
}
