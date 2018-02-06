import * as browser from '../';
import StatusIndicator from './status-indicator';
import COMMAND from '../../../browser/connection/command';


const CHECK_STATUS_DELAY = 1000;

var createXHR = () => new XMLHttpRequest();


class IdlePage {
    constructor (statusUrl, heartbeatUrl, initScriptUrl) {
        this.statusUrl       = statusUrl;
        this.statusIndicator = new StatusIndicator();

        browser.startHeartbeat(heartbeatUrl, createXHR);
        browser.startInitScriptExecution(initScriptUrl, createXHR);

        this._checkStatus();

        document.title = '[' + document.location.toString() + ']';

        this.checkStatusCount = 0;
    }

    _checkStatus () {
        this.checkStatusCount++;
        if(this.checkStatusCount > 4) {
            debugger;
        }
        console.log('_checkStatus: ' + this.checkStatusCount);
        browser
            .checkStatus(this.statusUrl, createXHR)
            .then(cmd => {
                console.log('cmd: ' + cmd);
                if (cmd === COMMAND.idle)
                    window.setTimeout(() => this._checkStatus(), CHECK_STATUS_DELAY);
            })
            .catch(() => this.statusIndicator.showDisconnection());
    }
}

window.IdlePage = IdlePage;
