import OS from 'os-family';
import { parse as parseUrl } from 'url';
import dedicatedProviderBase from '../base';
import ChromeRunTimeInfo from './runtime-info';
import getConfig from './config';
import { start as startLocalChrome, stop as stopLocalChrome } from './local-chrome';
import * as cdp from './cdp';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../utils/client-functions';

const MIN_AVAILABLE_DIMENSION = 50;

export default {
    ...dedicatedProviderBase,

    _getConfig (name) {
        return getConfig(name);
    },

    _getBrowserProtocolClient () {
        return cdp;
    },

    async _createRunTimeInfo (hostName, configString, allowMultipleWindows) {
        return ChromeRunTimeInfo.create(hostName, configString, allowMultipleWindows);
    },

    async openBrowser (browserId, pageUrl, configString, allowMultipleWindows) {
        const parsedPageUrl = parseUrl(pageUrl);
        const runtimeInfo   = await this._createRunTimeInfo(parsedPageUrl.hostname, configString, allowMultipleWindows);

        runtimeInfo.browserName = this._getBrowserName();
        runtimeInfo.browserId   = browserId;

        runtimeInfo.providerMethods = {
            resizeLocalBrowserWindow: (...args) => this.resizeLocalBrowserWindow(...args)
        };

        await startLocalChrome(pageUrl, runtimeInfo);

        await this.waitForConnectionReady(browserId);

        runtimeInfo.viewportSize   = await this.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        runtimeInfo.activeWindowId = null;

        if (allowMultipleWindows)
            runtimeInfo.activeWindowId = this.calculateWindowId();

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

    async getVideoFrameData (browserId) {
        return await cdp.getScreenshotData(this.openedBrowsers[browserId]);
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
            const newHeight = Math.max(availableHeight, MIN_AVAILABLE_DIMENSION);
            const newWidth  = Math.max(Math.floor(availableWidth / 2), MIN_AVAILABLE_DIMENSION);

            await this.resizeWindow(browserId, newWidth, newHeight, outerWidth, outerHeight);
        }
    }
};
