import browserTools from 'testcafe-browser-tools';
import OS from 'os-family';
import getRuntimeInfo from './runtime-info';
import getConfig from './config';
import { start as startLocalChrome, stop as stopLocalChrome } from './local-chrome';
import * as cdp from './cdp';


export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    async openBrowser (browserId, pageUrl, configString) {
        var runtimeInfo = await getRuntimeInfo(configString);
        var browserName = this.providerName.replace(':', '');

        await startLocalChrome(browserName, pageUrl, runtimeInfo);

        await this.waitForConnectionReady(browserId);

        var cdpClientInfo = await cdp.getClientInfo(browserId, runtimeInfo);

        Object.assign(runtimeInfo, cdpClientInfo);

        this.openedBrowsers[browserId] = runtimeInfo;
    },

    async closeBrowser (browserId) {
        var runtimeInfo = this.openedBrowsers[browserId];

        if (cdp.isHeadlessTab(runtimeInfo))
            await cdp.closeTab(runtimeInfo);
        else
            await browserTools.close(browserId);

        if (OS.mac || runtimeInfo.config.headless)
            await stopLocalChrome(runtimeInfo);

        delete this.openedBrowsers[browserId];
    },

    async isLocalBrowser (browserId, configString) {
        var config = this.openedBrowsers[browserId] ? this.openedBrowsers[browserId].config : getConfig(configString);

        return !config.headless;
    },

    async takeScreenshot (browserId, path) {
        var runtimeInfo = this.openedBrowsers[browserId];

        await cdp.takeScreenshot(path, runtimeInfo);
    },

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        var runtimeInfo = this.openedBrowsers[browserId];

        await cdp.resizeWindow({ width, height }, { width: currentWidth, height: currentHeight }, runtimeInfo);
    },

    async hasCustomActionForBrowser (browserId) {
        var { config, windowId, client } = this.openedBrowsers[browserId];

        return {
            hasResizeWindow:                !!client && (config.emulation || windowId || config.headless),
            hasTakeScreenshot:              !!client,
            hasCanResizeWindowToDimensions: false,
            hasMaximizeWindow:              false
        };
    }
};
