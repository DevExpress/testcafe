import { CloseAllChildWindowsMessage, SetAsMasterMessage } from '../messages';
import sendMessageToDriver from '../send-message-to-driver';
import { CannotSwitchToWindowError, CloseChildWindowError } from '../../../../errors/test-run';
import { WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT } from '../timeouts';

export default class ChildWindowDriverLink {
    constructor (driverWindow, windowId) {
        this.driverWindow = driverWindow;
        this.windowId     = windowId;
    }

    setAsMaster () {
        const msg = new SetAsMasterMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    closeAllChildWindows () {
        const msg = new CloseAllChildWindowsMessage();

        return sendMessageToDriver(msg, this.driverWindow, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CloseChildWindowError);
    }
}
