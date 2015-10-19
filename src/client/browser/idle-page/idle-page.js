import * as browser from '../';
import StatusIndicator from './status-indicator';
import COMMAND from '../../../browser-connection/command';


const CHECK_STATUS_DELAY = 1000;


export default class IdlePage {
    constructor (statusUrl) {
        this.statusIndicator = new StatusIndicator();
        this._checkStatus(statusUrl);
    }

    _checkStatus (statusUrl) {
        browser
            .checkStatus(statusUrl, window.XMLHttpRequest)
            .then((cmd) => {
                if (cmd === COMMAND.idle)
                    window.setTimeout(() => this._checkStatus(statusUrl), CHECK_STATUS_DELAY);
            })
            .catch(() => this.statusIndicator.showDisconnection())
    }
}
