import { open as openBrowser, close as closeBrowser } from 'testcafe-browser-natives';
import BrowserConnection from './index';


export default class LocalBrowserConnection extends BrowserConnection {
    constructor (gateway, browserInfo) {
        super(gateway);

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
        this.once('idle', async () => {
            await closeBrowser(this.idleUrl);
            super.close();
        });
    }
}
