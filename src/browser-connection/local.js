import { open as openBrowser, close as closeBrowser } from 'testcafe-browser-natives';
import BrowserConnection from './index';
import COMMANDS from './commands';


export default class LocalBrowserConnection extends BrowserConnection {
    static NATIVE_ACTION_DELAY = 500;

    constructor (gateway, browserInfo) {
        super(gateway);

        this.forceClose = false;

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
        this.forceClose = true;

        super.close();
    }

    getStatus () {
        if (this.forceClose) {
            setTimeout(() => closeBrowser(this.idleUrl), LocalBrowserConnection.NATIVE_ACTION_DELAY);

            return { cmd: COMMANDS.close };
        }

        return super.getStatus();
    }
}
