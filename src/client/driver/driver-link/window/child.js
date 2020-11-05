import {
    CloseAllChildWindowsMessage,
    StartToRestoreChildLinkMessage,
    SetAsMasterMessage
} from '../messages';

import sendMessageToDriver from '../send-message-to-driver';
import { CannotSwitchToWindowError, CloseChildWindowError } from '../../../../shared/errors';
import { WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT } from '../timeouts';

export default class ChildWindowDriverLink {
    constructor (driverWindow, windowId) {
        this.driverWindow = driverWindow;
        this.windowId     = windowId;
    }

    setAsMaster (finalizePendingCommand) {
        const msg = new SetAsMasterMessage(finalizePendingCommand);

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    closeAllChildWindows () {
        const msg = new CloseAllChildWindowsMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CloseChildWindowError);
    }

    findChildWindows (options, MessageCtor) {
        const msg = new MessageCtor(options);

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    startToRestore () {
        const msg = new StartToRestoreChildLinkMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }
}
