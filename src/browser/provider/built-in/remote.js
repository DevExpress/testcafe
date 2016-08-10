import BrowserProviderBase from './base';
import OS from 'os-family';
import WARNING_MESSAGE from '../../../warnings/message';


export default class RemoteBrowserProvider extends BrowserProviderBase {
    constructor () {
        super();

        // NOTE: This can be used to disable resize correction when running unit tests.
        this.disableResizeHack = false;
    }

    async openBrowser (id) {
        try {
            if (OS.win && !this.disableResizeHack)
                await super.calculateResizeCorrections(id);
        }
        catch (e) {
            return;
        }
    }

    async closeBrowser () {
        return;
    }

    // NOTE: we must try to do a local screenshot or resize, if browser is accessible, but emit warning
    async takeScreenshot (id, ...args) {
        try {
            await super.takeScreenshot(id, ...args);
        }
        catch (e) {
            this.reportWarning(id, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
        }
    }

    async resizeWindow (id, ...args) {
        try {
            await super.resizeWindow(id, ...args);
        }
        catch (e) {
            this.reportWarning(id, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
        }
    }
}
