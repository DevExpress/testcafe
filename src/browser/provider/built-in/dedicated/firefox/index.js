import OS from 'os-family';
import dedicatedProviderBase from '../base';
import getRuntimeInfo from './runtime-info';
import getConfig from './config';
import { start as startLocalFirefox, stop as stopLocalFirefox } from './local-firefox';
import MarionetteClient from './marionette-client';


export default {
    ...dedicatedProviderBase,

    _getConfig (name) {
        return getConfig(name);
    },

    _getBrowserProtocolClient (runtimeInfo) {
        return runtimeInfo.marionetteClient;
    },

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

    async openBrowser (browserId, pageUrl, configString, allowMultipleWindows) {
        const runtimeInfo = await getRuntimeInfo(configString);

        runtimeInfo.browserName = this._getBrowserName();
        runtimeInfo.browserId   = browserId;

        await startLocalFirefox(pageUrl, runtimeInfo);

        await this.waitForConnectionReady(runtimeInfo.browserId);

        if (allowMultipleWindows)
            runtimeInfo.activeWindowId = this.calculateWindowId();

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

    async resizeWindow (browserId, width, height) {
        const { marionetteClient } = this.openedBrowsers[browserId];

        await marionetteClient.setWindowSize(width, height);
    },

    async getVideoFrameData (browserId) {
        const { marionetteClient } = this.openedBrowsers[browserId];

        return await marionetteClient.getScreenshotData();
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
