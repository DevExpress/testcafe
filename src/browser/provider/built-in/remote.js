import debug from 'debug';
import { findWindow } from 'testcafe-browser-tools';
import WARNING_MESSAGE from '../../../notifications/warning-message';


const DEBUG_LOGGER = debug('testcafe:browser:provider:built-in:remote');

export default {
    canDetectLocalBrowsers: true,

    localBrowsersFlags: {},

    async openBrowser (browserId) {
        if (!this.canDetectLocalBrowsers)
            return;

        await this.waitForConnectionReady(browserId);

        let localBrowserWindow = null;

        try {
            localBrowserWindow = await findWindow(browserId);
        }
        catch (err) {
            // NOTE: We can suppress the error here since we can just disable window manipulation functions
            // when the browser is truly remote and we cannot find a local window descriptor
            DEBUG_LOGGER(err);
        }

        this.localBrowsersFlags[browserId] = localBrowserWindow !== null;
    },

    async closeBrowser (browserId) {
        delete this.localBrowsersFlags[browserId];
    },

    async isLocalBrowser (browserId) {
        // NOTE:
        // if browserId is not specified, then it means that a browser is not yet started
        // we may assume that it's not local, because
        // otherwise we'll just disable window manipulation function's after the browser will be started
        return !!browserId && this.localBrowsersFlags[browserId];
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
