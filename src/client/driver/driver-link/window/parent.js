import { SetAsMasterMessage } from '../messages';
import sendMessageToDriver from '../send-message-to-driver';
import { CannotSwitchToWindowError } from '../../../../errors/test-run';
import { WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT } from '../timeouts';

export default class ParentWindowDriverLink {
    constructor (currentDriverWindow) {
        this.currentDriverWindow = currentDriverWindow;
    }

    _getTopOpenedWindow (wnd) {
        let topOpened = wnd;

        while (topOpened.opener)
            topOpened = topOpened.opener;

        return topOpened;
    }

    _setAsMaster (wnd) {
        const msg = new SetAsMasterMessage();

        return sendMessageToDriver(msg, wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    setTopOpenedWindowAsMaster () {
        const wnd = this._getTopOpenedWindow(this.currentDriverWindow);

        return this._setAsMaster(wnd);
    }

    setParentWindowAsMaster () {
        const wnd = this.currentDriverWindow.opener;

        return this._setAsMaster(wnd);
    }
}
