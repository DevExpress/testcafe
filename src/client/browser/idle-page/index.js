import * as browser from '../';
import StatusIndicator from './status-indicator';
import COMMAND from '../../../browser/connection/command';


const createXHR = () => new XMLHttpRequest();

const CHECK_STATUS_DELAY = 1000;

class IdlePage {
    constructor (communicationUrls, options) {
        this.communicationUrls = communicationUrls;
        this.options           = options;

        this.statusIndicator = new StatusIndicator();

        document.title = '[' + document.location.toString() + ']';
    }

    async _pollStatus () {
        const urls = {
            statusUrl:           this.communicationUrls.statusUrl,
            openFileProtocolUrl: this.communicationUrls.openFileProtocolUrl,
        };

        let { command } = await browser.checkStatus(urls, createXHR, { proxyless: this.options.proxyless });

        while (command.cmd === COMMAND.idle) {
            await browser.delay(CHECK_STATUS_DELAY);

            ({ command } = await browser.checkStatus(urls, createXHR, { proxyless: this.options.proxyless }));
        }
    }

    async start () {
        if (this.options.retryTestPages)
            await browser.enableRetryingTestPages();

        browser.startHeartbeat(this.communicationUrls.heartbeatUrl, createXHR);
        browser.startInitScriptExecution(this.communicationUrls.initScriptUrl, createXHR);

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
