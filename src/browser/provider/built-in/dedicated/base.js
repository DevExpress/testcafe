import { getBrowserInfo } from 'testcafe-browser-tools';
import getMaximizedHeadlessWindowSize from '../../utils/get-maximized-headless-window-size';
import { cropScreenshot } from '../../../../screenshots/crop';
import { readPng, writePng } from '../../../../utils/promisified-functions';

export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    supportMultipleWindows: true,

    getActiveWindowId (browserId) {
        return this.openedBrowsers[browserId].activeWindowId;
    },

    setActiveWindowId (browserId, val) {
        this.openedBrowsers[browserId].activeWindowId = val;
    },

    _getConfig () {
        throw new Error('Not implemented');
    },

    _getBrowserProtocolClient (/* runtimeInfo */) {
        throw new Error('Not implemented');
    },

    _getBrowserName () {
        return this.providerName.replace(':', '');
    },

    async isValidBrowserName (browserName) {
        const config      = await this._getConfig(browserName);
        const browserInfo = await getBrowserInfo(config.path || this._getBrowserName());

        return !!browserInfo;
    },

    async isLocalBrowser () {
        return true;
    },

    isHeadlessBrowser (browserId) {
        return this.openedBrowsers[browserId].config.headless;
    },

    _getCropDimensions (viewportWidth, viewportHeight) {
        if (!viewportWidth || !viewportHeight)
            return null;

        return {
            left:   0,
            top:    0,
            right:  viewportWidth,
            bottom: viewportHeight
        };
    },

    async takeScreenshot (browserId, path, viewportWidth, viewportHeight, fullPage) {
        const runtimeInfo    = this.openedBrowsers[browserId];
        const browserClient  = this._getBrowserProtocolClient(runtimeInfo);
        const binaryImage    = await browserClient.getScreenshotData(runtimeInfo, fullPage);
        const cropDimensions = this._getCropDimensions(viewportWidth, viewportHeight);

        let pngImage = await readPng(binaryImage);

        if (!fullPage)
            pngImage = await cropScreenshot(pngImage, { path, cropDimensions }) || pngImage;

        await writePng(path, pngImage);
    },

    async maximizeWindow (browserId) {
        const maximumSize = getMaximizedHeadlessWindowSize();

        await this.resizeWindow(browserId, maximumSize.width, maximumSize.height, maximumSize.width, maximumSize.height);
    }
};
