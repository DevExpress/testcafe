import * as browser from '../';
import StatusIndicator from './status-indicator';
import COMMAND from '../../../browser/connection/command';


const createXHR = () => new XMLHttpRequest();

const CHECK_STATUS_DELAY = 1000;

class IdlePage {
    constructor (statusUrl, heartbeatUrl, initScriptUrl, { retryTestPages } = {}) {
        this.statusUrl       = statusUrl;
        this.heartbeatUrl    = heartbeatUrl;
        this.initScriptUrl   = initScriptUrl;
        this.statusIndicator = new StatusIndicator();

        this.retryTestPages = retryTestPages;

        document.title = '[' + document.location.toString() + ']';
    }

    async _pollStatus () {
        let { command } = await browser.checkStatus(this.statusUrl, createXHR);

        while (command.cmd === COMMAND.idle) {
            await browser.delay(CHECK_STATUS_DELAY);

            ({ command } = await browser.checkStatus(this.statusUrl, createXHR));
        }
    }

    async start () {
        if (this.retryTestPages)
            await browser.enableRetryingTestPages();

        browser.startHeartbeat(this.heartbeatUrl, createXHR);
        browser.startInitScriptExecution(this.initScriptUrl, createXHR);

        try {
            await this._pollStatus();
        }
        catch (error) {
            this.statusIndicator.showDisconnection();

            throw error;
        }
    }
}

window.IdlePage = IdlePage;
