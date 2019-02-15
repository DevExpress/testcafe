import Promise from 'pinkie';
import browserTools from 'testcafe-browser-tools';
import OS from 'os-family';
import BrowserConnection from '../connection';
import delay from '../../utils/delay';
import { GET_TITLE_SCRIPT, GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from './utils/client-functions';


const BROWSER_OPENING_DELAY = 2000;

const RESIZE_DIFF_SIZE = {
    width:  100,
    height: 100
};


function sumSizes (sizeA, sizeB) {
    return {
        width:  sizeA.width + sizeB.width,
        height: sizeA.height + sizeB.height
    };
}

function subtractSizes (sizeA, sizeB) {
    return {
        width:  sizeA.width - sizeB.width,
        height: sizeA.height - sizeB.height
    };
}

export default class BrowserProvider {
    constructor (plugin) {
        this.plugin      = plugin;
        this.initPromise = Promise.resolve(false);

        this.isMultiBrowser = this.plugin.isMultiBrowser;
        // HACK: The browser window has different border sizes in normal and maximized modes. So, we need to be sure that the window is
        // not maximized before resizing it in order to keep the mechanism of correcting the client area size working. When browser is started,
        // we are resizing it for the first time to switch the window to normal mode, and for the second time - to restore the client area size.
        this.localBrowsersInfo = {};
    }

    _createLocalBrowserInfo (browserId) {
        if (this.localBrowsersInfo[browserId])
            return;

        this.localBrowsersInfo[browserId] = {
            windowDescriptor:  null,
            maxScreenSize:     null,
            resizeCorrections: null
        };
    }

    _getWindowDescriptor (browserId) {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].windowDescriptor;
    }

    _getMaxScreenSize (browserId) {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].maxScreenSize;
    }

    _getResizeCorrections (browserId) {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].resizeCorrections;
    }

    _isBrowserIdle (browserId) {
        const connection = BrowserConnection.getById(browserId);

        return connection.idle;
    }

    async _calculateResizeCorrections (browserId) {
        if (!this._isBrowserIdle(browserId))
            return;

        const title = await this.plugin.runInitScript(browserId, GET_TITLE_SCRIPT);

        if (!await browserTools.isMaximized(title))
            return;

        const currentSize = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        const etalonSize  = subtractSizes(currentSize, RESIZE_DIFF_SIZE);

        await browserTools.resize(title, currentSize.width, currentSize.height, etalonSize.width, etalonSize.height);

        let resizedSize    = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        let correctionSize = subtractSizes(resizedSize, etalonSize);

        await browserTools.resize(title, resizedSize.width, resizedSize.height, etalonSize.width, etalonSize.height);

        resizedSize = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

        correctionSize = sumSizes(correctionSize, subtractSizes(resizedSize, etalonSize));

        if (this.localBrowsersInfo[browserId])
            this.localBrowsersInfo[browserId].resizeCorrections = correctionSize;

        await browserTools.maximize(title);
    }


    async _calculateMacSizeLimits (browserId) {
        if (!this._isBrowserIdle(browserId))
            return;

        const sizeInfo = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

        if (this.localBrowsersInfo[browserId]) {
            this.localBrowsersInfo[browserId].maxScreenSize = {
                width:  sizeInfo.availableWidth - (sizeInfo.outerWidth - sizeInfo.width),
                height: sizeInfo.availableHeight - (sizeInfo.outerHeight - sizeInfo.height)
            };
        }
    }

    async _ensureBrowserWindowDescriptor (browserId) {
        if (this._getWindowDescriptor(browserId))
            return;

        await this._createLocalBrowserInfo(browserId);

        // NOTE: delay to ensure the window finished the opening
        await this.plugin.waitForConnectionReady(browserId);
        await delay(BROWSER_OPENING_DELAY);

        if (this.localBrowsersInfo[browserId])
            this.localBrowsersInfo[browserId].windowDescriptor = await browserTools.findWindow(browserId);
    }

    async _ensureBrowserWindowParameters (browserId) {
        await this._ensureBrowserWindowDescriptor(browserId);

        if (OS.win && !this._getResizeCorrections(browserId))
            await this._calculateResizeCorrections(browserId);
        else if (OS.mac && !this._getMaxScreenSize(browserId))
            await this._calculateMacSizeLimits(browserId);
    }

    async _closeLocalBrowser (browserId) {
        await browserTools.close(this._getWindowDescriptor(browserId));
    }

    async _resizeLocalBrowserWindow (browserId, width, height, currentWidth, currentHeight) {
        const resizeCorrections = this._getResizeCorrections(browserId);

        if (resizeCorrections && await browserTools.isMaximized(this._getWindowDescriptor(browserId))) {
            width -= resizeCorrections.width;
            height -= resizeCorrections.height;
        }

        await browserTools.resize(this._getWindowDescriptor(browserId), currentWidth, currentHeight, width, height);
    }

    async _takeLocalBrowserScreenshot (browserId, screenshotPath) {
        await browserTools.screenshot(this._getWindowDescriptor(browserId), screenshotPath);
    }

    async _canResizeLocalBrowserWindowToDimensions (browserId, width, height) {
        if (!OS.mac)
            return true;

        const maxScreenSize = this._getMaxScreenSize(browserId);

        return width <= maxScreenSize.width && height <= maxScreenSize.height;
    }

    async _maximizeLocalBrowserWindow (browserId) {
        await browserTools.maximize(this._getWindowDescriptor(browserId));
    }

    async _canUseDefaultWindowActions (browserId) {
        const isLocalBrowser    = await this.plugin.isLocalBrowser(browserId);
        const isHeadlessBrowser = await this.plugin.isHeadlessBrowser(browserId);

        return isLocalBrowser && !isHeadlessBrowser;
    }

    async init () {
        const initialized = await this.initPromise;

        if (initialized)
            return;

        this.initPromise = this.plugin
            .init()
            .then(() => true);

        try {
            await this.initPromise;
        }
        catch (error) {
            this.initPromise = Promise.resolve(false);

            throw error;
        }
    }

    async dispose () {
        const initialized = await this.initPromise;

        if (!initialized)
            return;

        this.initPromise = this.plugin
            .dispose()
            .then(() => false);

        try {
            await this.initPromise;
        }
        catch (error) {
            this.initPromise = Promise.resolve(false);

            throw error;
        }
    }

    async isLocalBrowser (browserId, browserName) {
        return await this.plugin.isLocalBrowser(browserId, browserName);
    }

    isHeadlessBrowser (browserId) {
        return this.plugin.isHeadlessBrowser(browserId);
    }

    async openBrowser (browserId, pageUrl, browserName) {
        await this.plugin.openBrowser(browserId, pageUrl, browserName);

        if (await this._canUseDefaultWindowActions(browserId))
            await this._ensureBrowserWindowParameters(browserId);
    }

    async closeBrowser (browserId) {
        const canUseDefaultWindowActions = await this._canUseDefaultWindowActions(browserId);
        const customActionsInfo          = await this.hasCustomActionForBrowser(browserId);
        const hasCustomCloseBrowser      = customActionsInfo.hasCloseBrowser;
        const usePluginsCloseBrowser     = hasCustomCloseBrowser || !canUseDefaultWindowActions;

        if (usePluginsCloseBrowser)
            await this.plugin.closeBrowser(browserId);
        else
            await this._closeLocalBrowser(browserId);

        if (canUseDefaultWindowActions)
            delete this.localBrowsersInfo[browserId];
    }

    async getBrowserList () {
        return await this.plugin.getBrowserList();
    }

    async isValidBrowserName (browserName) {
        return await this.plugin.isValidBrowserName(browserName);
    }

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        const canUseDefaultWindowActions = await this._canUseDefaultWindowActions(browserId);
        const customActionsInfo          = await this.hasCustomActionForBrowser(browserId);
        const hasCustomResizeWindow      = customActionsInfo.hasResizeWindow;


        if (canUseDefaultWindowActions && !hasCustomResizeWindow) {
            await this._resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight);
            return;
        }

        await this.plugin.resizeWindow(browserId, width, height, currentWidth, currentHeight);
    }

    async canResizeWindowToDimensions (browserId, width, height) {
        const canUseDefaultWindowActions     = await this._canUseDefaultWindowActions(browserId);
        const customActionsInfo              = await this.hasCustomActionForBrowser(browserId);
        const hasCustomCanResizeToDimensions = customActionsInfo.hasCanResizeWindowToDimensions;


        if (canUseDefaultWindowActions && !hasCustomCanResizeToDimensions)
            return await this._canResizeLocalBrowserWindowToDimensions(browserId, width, height);

        return await this.plugin.canResizeWindowToDimensions(browserId, width, height);
    }

    async maximizeWindow (browserId) {
        const canUseDefaultWindowActions = await this._canUseDefaultWindowActions(browserId);
        const customActionsInfo          = await this.hasCustomActionForBrowser(browserId);
        const hasCustomMaximizeWindow    = customActionsInfo.hasMaximizeWindow;

        if (canUseDefaultWindowActions && !hasCustomMaximizeWindow)
            return await this._maximizeLocalBrowserWindow(browserId);

        return await this.plugin.maximizeWindow(browserId);
    }

    async takeScreenshot (browserId, screenshotPath, pageWidth, pageHeight) {
        const canUseDefaultWindowActions = await this._canUseDefaultWindowActions(browserId);
        const customActionsInfo          = await this.hasCustomActionForBrowser(browserId);
        const hasCustomTakeScreenshot    = customActionsInfo.hasTakeScreenshot;

        if (canUseDefaultWindowActions && !hasCustomTakeScreenshot) {
            await this._takeLocalBrowserScreenshot(browserId, screenshotPath, pageWidth, pageHeight);
            return;
        }

        await this.plugin.takeScreenshot(browserId, screenshotPath, pageWidth, pageHeight);
    }

    async getVideoFrameData (browserId) {
        return this.plugin.getVideoFrameData(browserId);
    }

    async hasCustomActionForBrowser (browserId) {
        return this.plugin.hasCustomActionForBrowser(browserId);
    }

    async reportJobResult (browserId, status, data) {
        await this.plugin.reportJobResult(browserId, status, data);
    }
}
