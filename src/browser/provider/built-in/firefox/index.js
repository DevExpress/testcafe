import getRuntimeInfo from './runtime-info';
import { start as startLocalFirefox } from './local-firefox';
import MarionetteClient from './marionette-client';
import getConfig from './config';


export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    async openBrowser (browserId, pageUrl, configString) {
        var runtimeInfo = await getRuntimeInfo(configString);
        var browserName = this.providerName.replace(':', '');

        runtimeInfo.browserId   = browserId;
        runtimeInfo.browserName = browserName;

        await startLocalFirefox(pageUrl, runtimeInfo);

        if (runtimeInfo.config.headless) {
            var marionetteClient = new MarionetteClient(runtimeInfo.marionettePort);

            await marionetteClient.connect();

            runtimeInfo.marionetteClient = marionetteClient;
        }

        this.openedBrowsers[browserId] = runtimeInfo;
    },

    async closeBrowser (browserId) {
        var { config, marionetteClient } = this.openedBrowsers[browserId];

        if (config.headless)
            await marionetteClient.quit();
        else
            await this.closeLocalBrowser(browserId);

        delete this.openedBrowsers[browserId];
    },

    async isLocalBrowser (browserId, configString) {
        var config = this.openedBrowsers[browserId] ? this.openedBrowsers[browserId].config : getConfig(configString);

        return !config.headless;
    },

    async takeScreenshot (browserId, path) {
        var { marionetteClient } = this.openedBrowsers[browserId];

        await marionetteClient.takeScreenshot(path);
    },

    async resizeWindow (browserId, width, height) {
        var { marionetteClient } = this.openedBrowsers[browserId];

        await marionetteClient.setWindowSize(width, height);
    },

    async hasCustomActionForBrowser (browserId) {
        var { config, marionetteClient } = this.openedBrowsers[browserId];

        return {
            hasCloseBrowser:                true,
            hasResizeWindow:                !!marionetteClient && config.headless,
            hasTakeScreenshot:              !!marionetteClient && config.headless,
            hasCanResizeWindowToDimensions: false,
            hasMaximizeWindow:              false
        };
    }
};
