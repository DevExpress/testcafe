import OS from 'os-family';
import { parse as parseUrl } from 'url';
import getRuntimeInfo from './runtime-info';
import { start as startLocalChrome, stop as stopLocalChrome } from './local-chrome';
import * as cdp from './cdp';
import getMaximizedHeadlessWindowSize from '../../utils/get-maximized-headless-window-size';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../utils/client-functions';


const MIN_AVAILABLE_DIMENSION = 50;

export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    async openBrowser (browserId, pageUrl, configString) {
        const runtimeInfo = await getRuntimeInfo(parseUrl(pageUrl).hostname, configString);
        const browserName = this.providerName.replace(':', '');

        runtimeInfo.browserId   = browserId;
        runtimeInfo.browserName = browserName;

        runtimeInfo.providerMethods = {
            resizeLocalBrowserWindow: (...args) => this.resizeLocalBrowserWindow(...args)
        };

        await startLocalChrome(pageUrl, runtimeInfo);

        await this.waitForConnectionReady(browserId);

        runtimeInfo.viewportSize = await this.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

        await cdp.createClient(runtimeInfo);

        this.openedBrowsers[browserId] = runtimeInfo;

        await this._ensureWindowIsExpanded(browserId, runtimeInfo.viewportSize);
    },

    async closeBrowser (browserId) {
        const runtimeInfo = this.openedBrowsers[browserId];

        if (cdp.isHeadlessTab(runtimeInfo))
            await cdp.closeTab(runtimeInfo);
        else
            await this.closeLocalBrowser(browserId);

        if (OS.mac || runtimeInfo.config.headless)
            await stopLocalChrome(runtimeInfo);

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
        const runtimeInfo = this.openedBrowsers[browserId];

        await cdp.takeScreenshot(path, runtimeInfo);
    },

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        const runtimeInfo = this.openedBrowsers[browserId];

        if (runtimeInfo.config.mobile)
            await cdp.updateMobileViewportSize(runtimeInfo);
        else {
            runtimeInfo.viewportSize.width  = currentWidth;
            runtimeInfo.viewportSize.height = currentHeight;
        }

        await cdp.resizeWindow({ width, height }, runtimeInfo);
    },

    async maximizeWindow (browserId) {
        const maximumSize = getMaximizedHeadlessWindowSize();

        await this.resizeWindow(browserId, maximumSize.width, maximumSize.height, maximumSize.width, maximumSize.height);
    },

    async getVideoFrameData (browserId) {
        return await cdp.getVideoFrameData(this.openedBrowsers[browserId]);
    },

    async hasCustomActionForBrowser (browserId) {
        const { config, client } = this.openedBrowsers[browserId];

        return {
            hasCloseBrowser:                true,
            hasResizeWindow:                !!client && (config.emulation || config.headless),
            hasMaximizeWindow:              !!client && config.headless,
            hasTakeScreenshot:              !!client,
            hasChromelessScreenshots:       !!client,
            hasGetVideoFrameData:           !!client,
            hasCanResizeWindowToDimensions: false
        };
    },

    async _ensureWindowIsExpanded (browserId, { height, width, availableHeight, availableWidth, outerWidth, outerHeight }) {
        if (height < MIN_AVAILABLE_DIMENSION || width < MIN_AVAILABLE_DIMENSION) {
            const newHeight = availableHeight;
            const newWidth  = Math.floor(availableWidth / 2);

            await this.resizeWindow(browserId, newWidth, newHeight, outerWidth, outerHeight);
        }
    }
};
