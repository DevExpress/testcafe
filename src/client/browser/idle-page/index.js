import * as browser from '../';
import StatusIndicator from './status-indicator';
import COMMAND from '../../../browser-connection/command';


const CHECK_STATUS_DELAY = 1000;


class IdlePage {
    constructor (statusUrl, heartbeatUrl) {
        this.statusUrl       = statusUrl;
        this.statusIndicator = new StatusIndicator();

        browser.startHeartbeat(heartbeatUrl, window.XMLHttpRequest);
        this._checkStatus();

        document.title = '[' + document.location.toString() + ']';
    }

    _checkStatus () {
        browser
            .checkStatus(this.statusUrl, window.XMLHttpRequest)
            .then((cmd) => {
                if (cmd === COMMAND.idle)
                    window.setTimeout(() => this._checkStatus(), CHECK_STATUS_DELAY);
            })
            .catch(() => this.statusIndicator.showDisconnection())
    }
}

window.IdlePage = IdlePage;
