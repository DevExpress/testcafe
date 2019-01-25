import OS from 'os-family';
import getRuntimeInfo from './runtime-info';
import { start as startLocalFirefox, stop as stopLocalFirefox } from './local-firefox';
import MarionetteClient from './marionette-client';
import getMaximizedHeadlessWindowSize from '../../utils/get-maximized-headless-window-size';


export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    async _createMarionetteClient (runtimeInfo) {
        try {
            const marionetteClient = new MarionetteClient(runtimeInfo.marionettePort);

            await marionetteClient.connect();

            return marionetteClient;
        }
        catch (e) {
            return null;
        }
    },

    async openBrowser (browserId, pageUrl, configString) {
        const runtimeInfo = await getRuntimeInfo(configString);
        const browserName = this.providerName.replace(':', '');

        runtimeInfo.browserId   = browserId;
        runtimeInfo.browserName = browserName;

        await startLocalFirefox(pageUrl, runtimeInfo);

        await this.waitForConnectionReady(runtimeInfo.browserId);

        if (runtimeInfo.marionettePort)
            runtimeInfo.marionetteClient = await this._createMarionetteClient(runtimeInfo);

        this.openedBrowsers[browserId] = runtimeInfo;
    },

    async closeBrowser (browserId) {
        const runtimeInfo = this.openedBrowsers[browserId];
        const { config, marionetteClient } = runtimeInfo;

        if (config.headless)
            await marionetteClient.quit();
        else
            await this.closeLocalBrowser(browserId);

        if (OS.mac && !config.headless)
            await stopLocalFirefox(runtimeInfo);

        if (runtimeInfo.tempProfileDir)
            await runtimeInfo.tempProfileDir.dispose();

        delete this.openedBrowsers[browserId];
    },

    async isLocalBrowser () {
        return true;
    },

    isHeadlessBrowser (browserId) {
        return this.openedBrowsers[browserId].config.headless;
    },

    async takeScreenshot (browserId, path) {
        const { marionetteClient } = this.openedBrowsers[browserId];

        await marionetteClient.takeScreenshot(path);
    },

    async resizeWindow (browserId, width, height) {
        const { marionetteClient } = this.openedBrowsers[browserId];

        await marionetteClient.setWindowSize(width, height);
    },

    async maximizeWindow (browserId) {
        const maximumSize = getMaximizedHeadlessWindowSize();

        await this.resizeWindow(browserId, maximumSize.width, maximumSize.height);
    },

    async getVideoFrameData (browserId) {
        const { marionetteClient } = this.openedBrowsers[browserId];

        return await marionetteClient.getVideoFrameData();
    },

    async hasCustomActionForBrowser (browserId) {
        const { config, marionetteClient } = this.openedBrowsers[browserId];

        return {
            hasCloseBrowser:                true,
            hasTakeScreenshot:              !!marionetteClient,
            hasChromelessScreenshots:       !!marionetteClient,
            hasGetVideoFrameData:           !!marionetteClient,
            hasResizeWindow:                !!marionetteClient && config.headless,
            hasMaximizeWindow:              !!marionetteClient && config.headless,
            hasCanResizeWindowToDimensions: false
        };
    }
};
