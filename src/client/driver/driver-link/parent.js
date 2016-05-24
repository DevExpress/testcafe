import { eventSandbox } from '../deps/hammerhead';
import INTER_DRIVER_MESSAGES from './messages';
import sendMessageWithConfirmation from './send-message-with-confirmation';


export default class ParentDriverLink {
    constructor (parentDriverWindow) {
        this.driverWindow = parentDriverWindow;
    }

    establishConnection () {
        var msg = { cmd: INTER_DRIVER_MESSAGES.establishConnection };

        return sendMessageWithConfirmation(msg, this.driverWindow)
            .then(response => response.result.id);
    }

    confirmMessageReceived (requestMsg) {
        var msg = {
            cmd:       INTER_DRIVER_MESSAGES.confirmation,
            requestId: requestMsg.requestId
        };

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }

    onCommandExecuted (status) {
        var msg = { cmd: INTER_DRIVER_MESSAGES.onCommandExecuted, status };

        eventSandbox.message.sendServiceMsg(msg, this.driverWindow);
    }
}
