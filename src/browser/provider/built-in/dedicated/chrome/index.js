import OS from 'os-family';
import { parse as parseUrl } from 'url';
import dedicatedProviderBase from '../base';
import ChromeRunTimeInfo from './runtime-info';
import getConfig from './config';
import {
    start as startLocalChrome,
    startOnDocker as startLocalChromeOnDocker,
    stop as stopLocalChrome,
} from './local-chrome';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../utils/client-functions';
import { BrowserClient } from './cdp-client';
import { dispatchEvent as dispatchNativeAutomationEvent, navigateTo } from '../../../../../native-automation/utils/cdp';
import { chromeBrowserProviderLogger } from '../../../../../utils/debug-loggers';
import { EventType } from '../../../../../native-automation/types';
import delay from '../../../../../utils/delay';
import { toNativeAutomationSetupOptions } from '../../../../../native-automation/utils/convert';

const MIN_AVAILABLE_DIMENSION = 50;

export default {
    ...dedicatedProviderBase,

    getConfig (name) {
        return getConfig(name);
    },

    async getCurrentCDPSession (browserId) {
        const { browserClient } = this.openedBrowsers[browserId];
        const cdpClient         = await browserClient.getActiveClient();

        return cdpClient;
    },

    _getBrowserProtocolClient (runtimeInfo) {
        return runtimeInfo.browserClient;
    },

    async _createRunTimeInfo (hostName, config, disableMultipleWindows) {
        return ChromeRunTimeInfo.create(hostName, config, disableMultipleWindows);
    },

    _setUserAgentMetaInfoForEmulatingDevice (browserId, config) {
        const { emulation, deviceName } = config;
        const isDeviceEmulation         = emulation && deviceName;

        if (!isDeviceEmulation)
            return;

        const metaInfo = `Emulating ${deviceName}`;
        const options  = {
            appendToUserAgent: true,
        };

        this.setUserAgentMetaInfo(browserId, metaInfo, options);
    },

    async _setupNativeAutomation ({ browserClient, runtimeInfo, nativeAutomationOptions }) {
        const nativeAutomation = await browserClient.createMainWindowNativeAutomation(nativeAutomationOptions);

        await nativeAutomation.start();

        runtimeInfo.nativeAutomation = nativeAutomation;
    },

    async _startChrome (startOptions, pageUrl) {
        if (startOptions.isContainerized)
            await startLocalChromeOnDocker(pageUrl, startOptions);
        else
            await startLocalChrome(pageUrl, startOptions);
    },

    async openBrowser (browserId, pageUrl, config, additionalOptions) {
        const parsedPageUrl = parseUrl(pageUrl);
        const runtimeInfo   = await this._createRunTimeInfo(parsedPageUrl.hostname, config, additionalOptions.disableMultipleWindows);

        runtimeInfo.browserName = this._getBrowserName();
        runtimeInfo.browserId   = browserId;

        runtimeInfo.providerMethods = {
            resizeLocalBrowserWindow: (...args) => this.resizeLocalBrowserWindow(...args),
            reportWarning:            (...args) => this.reportWarning(browserId, ...args),
        };

        //NOTE: A not-working tab is opened when the browser start in the docker so we should create a new tab.
        await this._startChrome(Object.assign({ isNativeAutomation: additionalOptions.nativeAutomation }, runtimeInfo), pageUrl);
        await this.waitForConnectionReady(browserId);

        runtimeInfo.viewportSize      = await this.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        runtimeInfo.activeWindowId    = null;
        runtimeInfo.windowDescriptors = {};

        const browserClient = new BrowserClient(runtimeInfo);

        this.openedBrowsers[browserId] = runtimeInfo;

        if (additionalOptions.nativeAutomation)
            await this._setupNativeAutomation({ browserId, browserClient, runtimeInfo, nativeAutomationOptions: toNativeAutomationSetupOptions(additionalOptions, config.headless) });

        if (additionalOptions.nativeAutomation || !additionalOptions.disableMultipleWindows)
            runtimeInfo.activeWindowId = runtimeInfo?.nativeAutomation?.windowId || this.calculateWindowId();

        await browserClient.initMainWindowCdpClient();

        await this._ensureWindowIsExpanded(browserId, runtimeInfo.viewportSize);

        this._setUserAgentMetaInfoForEmulatingDevice(browserId, runtimeInfo.config);

        chromeBrowserProviderLogger('browser opened %s', browserId);
    },

    async closeBrowser (browserId, closingInfo = {}) {
        const runtimeInfo = this.openedBrowsers[browserId];

        if (runtimeInfo.nativeAutomation)
            await runtimeInfo.nativeAutomation.dispose();

        if (runtimeInfo.browserClient.isHeadlessTab())
            await runtimeInfo.browserClient.closeTab();
        else
            await this.closeLocalBrowser(browserId);

        if (OS.mac || runtimeInfo.config.headless)
            await stopLocalChrome(runtimeInfo);

        if (runtimeInfo.tempProfileDir && !closingInfo.isRestarting)
            await runtimeInfo.tempProfileDir.dispose();

        delete this.openedBrowsers[browserId];

        chromeBrowserProviderLogger('browser closed %s', browserId);
    },

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        const runtimeInfo = this.openedBrowsers[browserId];

        if (runtimeInfo.config.mobile)
            await runtimeInfo.browserClient.updateMobileViewportSize();
        else {
            runtimeInfo.viewportSize.width  = currentWidth;
            runtimeInfo.viewportSize.height = currentHeight;
        }

        await runtimeInfo.browserClient.resizeWindow({ width, height });
    },

    async startCapturingVideo (browserId) {
        const { browserClient } = this.openedBrowsers[browserId];

        await browserClient.startCapturingVideo();
    },

    async stopCapturingVideo (browserId) {
        const { browserClient } = this.openedBrowsers[browserId];

        await browserClient.stopCapturingVideo();
    },

    async getVideoFrameData (browserId) {
        const { browserClient } = this.openedBrowsers[browserId];

        return browserClient.getVideoFrameData();
    },

    async hasCustomActionForBrowser (browserId) {
        const { config, browserClient } = this.openedBrowsers[browserId];
        const client                    = await browserClient.getActiveClient();

        return {
            hasCloseBrowser:                true,
            hasResizeWindow:                !!client && (config.emulation || config.headless),
            hasMaximizeWindow:              !!client && config.headless,
            hasTakeScreenshot:              !!client,
            hasChromelessScreenshots:       !!client,
            hasGetVideoFrameData:           !!client,
            hasCanResizeWindowToDimensions: false,
        };
    },

    async _ensureWindowIsExpanded (browserId, { height, width, availableHeight, availableWidth, outerWidth, outerHeight }) {
        if (height < MIN_AVAILABLE_DIMENSION || width < MIN_AVAILABLE_DIMENSION) {
            const newHeight = Math.max(availableHeight, MIN_AVAILABLE_DIMENSION);
            const newWidth  = Math.max(Math.floor(availableWidth / 2), MIN_AVAILABLE_DIMENSION);

            await this.resizeWindow(browserId, newWidth, newHeight, outerWidth, outerHeight);
        }
    },

    async openFileProtocol (browserId, url) {
        const cdpClient = await this.getCurrentCDPSession(browserId);

        await navigateTo(cdpClient, url);
    },

    async dispatchNativeAutomationEvent (browserId, type, options) {
        const cdpClient = await this.getCurrentCDPSession(browserId);

        await dispatchNativeAutomationEvent(cdpClient, type, options);
    },

    async dispatchNativeAutomationEventSequence (browserId, eventSequence) {
        const cdpClient = await this.getCurrentCDPSession(browserId);

        for (const event of eventSequence) {
            if (event.type === EventType.Delay)
                await delay(event.options.delay);
            else
                await dispatchNativeAutomationEvent(cdpClient, event.type, event.options);
        }
    },

    supportNativeAutomation () {
        return true;
    },

    getNativeAutomation (browserId) {
        const runtimeInfo = this.openedBrowsers[browserId];

        return runtimeInfo.nativeAutomation;
    },

    async getNewWindowIdInNativeAutomation (browserId) {
        const runtimeInfo = this.openedBrowsers[browserId];

        return runtimeInfo.nativeAutomation.getNewWindowIdInNativeAutomation();
    },
};
