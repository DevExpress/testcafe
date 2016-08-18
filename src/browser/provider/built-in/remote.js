import BrowserProviderBase from './base';
import OS from 'os-family';
import WARNING_MESSAGE from '../../../warnings/message';


export default class RemoteBrowserProvider extends BrowserProviderBase {
    constructor () {
        super();

        // NOTE: This can be used to disable resize correction when running unit tests.
        this.disableResizeHack = false;
    }

    async openBrowser (browserId) {
        try {
            if (OS.win && !this.disableResizeHack)
                await super.calculateResizeCorrections(browserId);
        }
        catch (e) {
            return;
        }
    }

    async closeBrowser () {
        return;
    }

    // NOTE: we must try to do a local screenshot or resize, if browser is accessible, but emit warning
    async takeScreenshot (browserId, ...args) {
        try {
            await super.takeScreenshot(browserId, ...args);
        }
        catch (e) {
            this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
        }
    }

    async resizeWindow (browserId, ...args) {
        try {
            await super.resizeWindow(browserId, ...args);
        }
        catch (e) {
            this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
        }
    }
}
