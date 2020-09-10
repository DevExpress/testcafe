import { eventSandbox } from '../../deps/hammerhead';
import { EstablishConnectionMessage, CommandExecutedMessage } from '../messages';
import { CurrentIframeIsNotLoadedError } from '../../../../shared/errors';
import sendMessageToDriver from '../send-message-to-driver';
import { WAIT_FOR_IFRAME_DRIVER_RESPONSE_TIMEOUT } from '../timeouts';
import sendConfirmationMessage from '../send-confirmation-message';

export default class ParentIframeDriverLink {
    constructor (parentDriverWindow) {
        this.driverWindow = parentDriverWindow;
    }

    establishConnection () {
        const msg = new EstablishConnectionMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_IFRAME_DRIVER_RESPONSE_TIMEOUT, CurrentIframeIsNotLoadedError)
            .then(response => response.result.id);
    }

    sendConfirmationMessage (requestMsgId) {
        sendConfirmationMessage({
            requestMsgId,
            window: this.driverWindow
        });
    }

    onCommandExecuted (status) {
        const msg = new CommandExecutedMessage(status);

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }
}
