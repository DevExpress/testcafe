import { findWindow } from 'testcafe-browser-tools';
import WARNING_MESSAGE from '../../../notifications/warning-message';


export default {
    canDetectLocalBrowsers: true,

    localBrowsersFlags: {},

    async openBrowser (browserId) {
        if (!this.canDetectLocalBrowsers)
            return;

        await this.waitForConnectionReady(browserId);

        const localBrowserWindow = await findWindow(browserId);

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
        const isLocalBrowser = this.localBrowsersFlags[browserId];

        return {
            hasCloseBrowser:                true,
            hasResizeWindow:                !isLocalBrowser,
            hasMaximizeWindow:              !isLocalBrowser,
            hasTakeScreenshot:              !isLocalBrowser,
            hasCanResizeWindowToDimensions: !isLocalBrowser
        };
    },

    async takeScreenshot (browserId) {
        this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
    },

    async resizeWindow (browserId) {
        this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
    },

    async maximizeWindow (browserId) {
        this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsOnRemoteBrowser);
    }
};
