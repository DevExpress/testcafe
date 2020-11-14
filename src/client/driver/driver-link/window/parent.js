import { SetAsMasterMessage, RestoreChildLinkMessage } from '../messages';
import sendMessageToDriver from '../send-message-to-driver';
import { CannotSwitchToWindowError } from '../../../../shared/errors';
import { WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT } from '../timeouts';

export default class ParentWindowDriverLink {
    constructor (currentDriverWindow) {
        this.currentDriverWindow = currentDriverWindow;
    }

    _getTopOpenedWindow (wnd) {
        let topOpened = wnd;

        while (topOpened.opener)
            topOpened = topOpened.opener;

        return topOpened.top;
    }

    _setAsMaster (wnd, finalizePendingCommand) {
        const msg = new SetAsMasterMessage(finalizePendingCommand);

        return sendMessageToDriver(msg, wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }

    getTopOpenedWindow () {
        return this._getTopOpenedWindow(this.currentDriverWindow);
    }

    setTopOpenedWindowAsMaster () {
        const wnd = this._getTopOpenedWindow(this.currentDriverWindow);

        return this._setAsMaster(wnd);
    }

    setParentWindowAsMaster (opts = {}) {
        const wnd = this.currentDriverWindow.opener;

        return this._setAsMaster(wnd, opts.finalizePendingCommand);
    }

    async restoreChild (windowId) {
        const msg = new RestoreChildLinkMessage(windowId);
        const wnd = this.currentDriverWindow.opener;

        sendMessageToDriver(msg, wnd, WAIT_FOR_WINDOW_DRIVER_RESPONSE_TIMEOUT, CannotSwitchToWindowError);
    }
}
