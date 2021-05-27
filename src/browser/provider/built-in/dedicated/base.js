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

    getPageTitle (browserId) {
        const runtimeInfo     = this.openedBrowsers[browserId];
        const isIdlePageShown = !Object.keys(runtimeInfo.windowDescriptors).length;

        return isIdlePageShown ? browserId : runtimeInfo.activeWindowId;
    },

    getWindowDescriptor (browserId) {
        const runtimeInfo = this.openedBrowsers[browserId];

        return runtimeInfo.windowDescriptors[runtimeInfo.activeWindowId];
    },

    setWindowDescriptor (browserId, windowDescriptor) {
        const runtimeInfo = this.openedBrowsers[browserId];

        runtimeInfo.windowDescriptors[runtimeInfo.activeWindowId] = windowDescriptor;
    },

    getConfig () {
        throw new Error('Not implemented');
    },

    _getBrowserProtocolClient (/* runtimeInfo */) {
        throw new Error('Not implemented');
    },

    _getBrowserName () {
        return this.providerName.replace(':', '');
    },

    async isValidBrowserName (browserName) {
        const config      = await this.getConfig(browserName);
        const browserInfo = await getBrowserInfo(config.path || this._getBrowserName());

        return !!browserInfo;
    },

    async isLocalBrowser () {
        return true;
    },

    isHeadlessBrowser (browserId, browserName) {
        if (browserId)
            return this.openedBrowsers[browserId].config.headless;

        const config = this.getConfig(browserName);

        return !!config.headless;
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
        const binaryImage    = await browserClient.getScreenshotData(fullPage);
        const cropDimensions = this._getCropDimensions(viewportWidth, viewportHeight);

        let pngImage = await readPng(binaryImage);

        if (!fullPage)
            pngImage = await cropScreenshot(pngImage, { path, cropDimensions }) || pngImage;

        await writePng(path, pngImage);
    },

    async maximizeWindow (browserId) {
        const maximumSize = getMaximizedHeadlessWindowSize();

        await this.resizeWindow(browserId, maximumSize.width, maximumSize.height, maximumSize.width, maximumSize.height);
    },

    async executeClientFunction (browserId, command, callsite) {
        const runtimeInfo   = this.openedBrowsers[browserId];
        const browserClient = this._getBrowserProtocolClient(runtimeInfo);

        return browserClient.executeClientFunction(command, callsite);
    },

    async switchToIframe (browserId) {
        const runtimeInfo   = this.openedBrowsers[browserId];
        const browserClient = this._getBrowserProtocolClient(runtimeInfo);

        return browserClient.switchToIframe();
    },

    async switchToMainWindow (browserId) {
        const runtimeInfo   = this.openedBrowsers[browserId];
        const browserClient = this._getBrowserProtocolClient(runtimeInfo);

        return browserClient.switchToMainWindow();
    }
};
