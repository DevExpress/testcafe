import { findWindow } from 'testcafe-browser-tools';
import WARNING_MESSAGE from '../../../warnings/message';


export default {
    localBrowsersFlags: {},

    async openBrowser (browserId) {
        await this.waitForConnectionReady(browserId);

        var localBrowserWindow = await findWindow(browserId);

        this.localBrowsersFlags[browserId] = localBrowserWindow !== null;
    },

    async closeBrowser (browserId) {
        delete this.localBrowsersFlags[browserId];
    },

    async isLocalBrowser (browserId) {
        return this.localBrowsersFlags[browserId];
    },

    // NOTE: we must try to do a local screenshot or resize, if browser is accessible, and emit warning otherwise
    async hasCustomActionForBrowser (browserId) {
        var isLocalBrowser = this.localBrowsersFlags[browserId];

        return {
            hasResizeWindow:                !isLocalBrowser,
            hasTakeScreenshot:              !isLocalBrowser,
            hasCanResizeWindowToDimensions: !isLocalBrowser
        };
    },

    async takeScreenshot (browserId) {
        this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
    },

    async resizeWindow (browserId) {
        this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
    }
};
