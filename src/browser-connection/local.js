import { open as openBrowser, close as closeBrowser } from 'testcafe-browser-natives';
import BrowserConnection from './index';
import COMMAND from './command';


export default class LocalBrowserConnection extends BrowserConnection {
    static NATIVE_ACTION_DELAY = 500;

    constructor (gateway, browserInfo) {
        super(gateway);

        this.forceClose            = false;
        this.switchedToIdleOnClose = false;

        this._runBrowser(browserInfo);
    }


    _runBrowser (browserInfo) {
        // NOTE: Give caller time to assign event listeners
        process.nextTick(async () => {
            try {
                await openBrowser(browserInfo, this.url);
            }
            catch (err) {
                this.emit('error', err.message);
            }
        });
    }


    close () {
        // NOTE: When using local connections, we should close the browser before closing
        // the connection. For this, we close connections in the getStatus function.
        this.forceClose = true;
    }

    getStatus () {
        if (this.forceClose) {
            // NOTE: when the task is done we should redirect the browser
            // to the idle page and close it by the page url.
            if (!this.switchedToIdleOnClose) {
                this.switchedToIdleOnClose = true;

                return { cmd: COMMAND.idle, url: this.idleUrl };
            }

            setTimeout(() => {
                closeBrowser(this.idleUrl);
                super.close();
            }, LocalBrowserConnection.NATIVE_ACTION_DELAY);

            return { cmd: COMMAND.close };
        }

        return super.getStatus();
    }
}
