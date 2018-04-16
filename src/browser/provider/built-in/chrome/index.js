import OS from 'os-family';
import { parse as parseUrl } from 'url';
import getRuntimeInfo from './runtime-info';
import getConfig from './config';
import { start as startLocalChrome, stop as stopLocalChrome } from './local-chrome';
import * as cdp from './cdp';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../utils/client-functions';


export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    async openBrowser (browserId, pageUrl, configString) {
        var runtimeInfo = await getRuntimeInfo(parseUrl(pageUrl).hostname, configString);
        var browserName = this.providerName.replace(':', '');

        runtimeInfo.browserId   = browserId;
        runtimeInfo.browserName = browserName;

        runtimeInfo.providerMethods = {
            resizeLocalBrowserWindow: (...args) => this.resizeLocalBrowserWindow(...args)
        };

        await startLocalChrome(pageUrl, runtimeInfo);

        await this.waitForConnectionReady(browserId);

        runtimeInfo.viewportSize = await this.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

        if (runtimeInfo.config.headless || runtimeInfo.config.emulation)
            await cdp.createClient(runtimeInfo);

        this.openedBrowsers[browserId] = runtimeInfo;
    },

    async closeBrowser (browserId) {
        var runtimeInfo = this.openedBrowsers[browserId];

        if (cdp.isHeadlessTab(runtimeInfo))
            await cdp.closeTab(runtimeInfo);
        else
            await this.closeLocalBrowser(browserId);

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

        if (runtimeInfo.config.mobile)
            await cdp.updateMobileViewportSize(runtimeInfo);
        else {
            runtimeInfo.viewportSize.width  = currentWidth;
            runtimeInfo.viewportSize.height = currentHeight;
        }

        await cdp.resizeWindow({ width, height }, runtimeInfo);
    },

    async hasCustomActionForBrowser (browserId) {
        var { config, client } = this.openedBrowsers[browserId];

        return {
            hasCloseBrowser:                true,
            hasResizeWindow:                !!client && (config.emulation || config.headless),
            hasTakeScreenshot:              !!client,
            hasCanResizeWindowToDimensions: false,
            hasMaximizeWindow:              false
        };
    }
};
