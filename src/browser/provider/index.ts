import browserTools from 'testcafe-browser-tools';
import OS from 'os-family';
import { dirname } from 'path';
import makeDir from 'make-dir';
import BrowserConnection from '../connection';
import delay from '../../utils/delay';
import { GET_TITLE_SCRIPT, GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from './utils/client-functions';
import WARNING_MESSAGE from '../../notifications/warning-message';
import { Dictionary } from '../../configuration/interfaces';

const BROWSER_OPENING_DELAY = 2000;

const RESIZE_DIFF_SIZE = {
    width:  100,
    height: 100
};

interface Size {
    width: number;
    height: number;
}

interface LocalBrowserInfo {
    windowDescriptor: null | string;
    maxScreenSize: null | Size;
    resizeCorrections: null | Size;
}

function sumSizes (sizeA: Size, sizeB: Size): Size {
    return {
        width:  sizeA.width + sizeB.width,
        height: sizeA.height + sizeB.height
    };
}

function subtractSizes (sizeA: Size, sizeB: Size): Size {
    return {
        width:  sizeA.width - sizeB.width,
        height: sizeA.height - sizeB.height
    };
}

export default class BrowserProvider {
    private plugin: any;
    private initPromise: Promise<any>;
    private isMultiBrowser: boolean;
    private readonly localBrowsersInfo: Dictionary<LocalBrowserInfo>;

    public constructor (plugin: any) {
        this.plugin         = plugin;
        this.initPromise    = Promise.resolve(false);
        this.isMultiBrowser = this.plugin.isMultiBrowser;
        // HACK: The browser window has different border sizes in normal and maximized modes. So, we need to be sure that the window is
        // not maximized before resizing it in order to keep the mechanism of correcting the client area size working. When browser is started,
        // we are resizing it for the first time to switch the window to normal mode, and for the second time - to restore the client area size.
        this.localBrowsersInfo = {};
    }

    private _ensureLocalBrowserInfo (browserId: string): void {
        if (this.localBrowsersInfo[browserId])
            return;

        this.localBrowsersInfo[browserId] = {
            windowDescriptor:  null,
            maxScreenSize:     null,
            resizeCorrections: null
        };
    }

    private _getWindowDescriptor (browserId: string): string | null {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].windowDescriptor;
    }

    private _getMaxScreenSize (browserId: string): Size | null {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].maxScreenSize;
    }

    private _getResizeCorrections (browserId: string): Size | null {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].resizeCorrections;
    }

    private _isBrowserIdle (browserId: string): boolean {
        const connection = BrowserConnection.getById(browserId) as BrowserConnection;

        return connection.idle;
    }

    private async _calculateResizeCorrections (browserId: string): Promise<void> {
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

    private async _calculateMacSizeLimits (browserId: string): Promise<void> {
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

    private async _ensureBrowserWindowDescriptor (browserId: string): Promise<void> {
        if (this._getWindowDescriptor(browserId))
            return;

        await this._ensureLocalBrowserInfo(browserId);

        // NOTE: delay to ensure the window finished the opening
        await this.plugin.waitForConnectionReady(browserId);
        await delay(BROWSER_OPENING_DELAY);

        if (this.localBrowsersInfo[browserId])
            this.localBrowsersInfo[browserId].windowDescriptor = await browserTools.findWindow(browserId);
    }

    private async _ensureBrowserWindowParameters (browserId: string): Promise<void> {
        await this._ensureBrowserWindowDescriptor(browserId);

        if (OS.win && !this._getResizeCorrections(browserId))
            await this._calculateResizeCorrections(browserId);
        else if (OS.mac && !this._getMaxScreenSize(browserId))
            await this._calculateMacSizeLimits(browserId);
    }

    private async _closeLocalBrowser (browserId: string): Promise<void> {
        if (this.plugin.needCleanUpBrowserInfo)
            this.plugin.cleanUpBrowserInfo(browserId);

        const windowDescriptor = this._getWindowDescriptor(browserId);

        await browserTools.close(windowDescriptor);
    }

    private async _resizeLocalBrowserWindow (browserId: string, width: number, height: number, currentWidth: number, currentHeight: number): Promise<void> {
        const resizeCorrections = this._getResizeCorrections(browserId);

        if (resizeCorrections && await browserTools.isMaximized(this._getWindowDescriptor(browserId))) {
            width -= resizeCorrections.width;
            height -= resizeCorrections.height;
        }

        await browserTools.resize(this._getWindowDescriptor(browserId), currentWidth, currentHeight, width, height);
    }

    private async _takeLocalBrowserScreenshot (browserId: string, screenshotPath: string): Promise<void> {
        await browserTools.screenshot(this._getWindowDescriptor(browserId), screenshotPath);
    }

    private async _canResizeLocalBrowserWindowToDimensions (browserId: string, width: number, height: number): Promise<boolean> {
        if (!OS.mac)
            return true;

        const maxScreenSize = this._getMaxScreenSize(browserId) as Size;

        return width <= maxScreenSize.width && height <= maxScreenSize.height;
    }

    private async _maximizeLocalBrowserWindow (browserId: string): Promise<void> {
        await browserTools.maximize(this._getWindowDescriptor(browserId));
    }

    public async canUseDefaultWindowActions (browserId: string): Promise<boolean> {
        const isLocalBrowser    = await this.plugin.isLocalBrowser(browserId);
        const isHeadlessBrowser = await this.plugin.isHeadlessBrowser(browserId);

        return isLocalBrowser && !isHeadlessBrowser;
    }

    public async init (): Promise<void> {
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

    public async dispose (): Promise<void> {
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

    public async isLocalBrowser (browserId?: string, browserName?: string): Promise<boolean> {
        return await this.plugin.isLocalBrowser(browserId, browserName);
    }

    public isHeadlessBrowser (browserId: string): Promise<boolean> {
        return this.plugin.isHeadlessBrowser(browserId);
    }

    public async openBrowser (browserId: string, pageUrl: string, browserName: string, allowMultipleWindows: boolean): Promise<void> {
        await this.plugin.openBrowser(browserId, pageUrl, browserName, allowMultipleWindows);

        if (await this.canUseDefaultWindowActions(browserId))
            await this._ensureBrowserWindowParameters(browserId);
    }

    public async closeBrowser (browserId: string): Promise<void> {
        const canUseDefaultWindowActions = await this.canUseDefaultWindowActions(browserId);
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

    public async getBrowserList (): Promise<string[]> {
        return await this.plugin.getBrowserList();
    }

    public async isValidBrowserName (browserName: string): Promise<boolean> {
        return await this.plugin.isValidBrowserName(browserName);
    }

    public async resizeWindow (browserId: string, width: number, height: number, currentWidth: number, currentHeight: number): Promise<void> {
        const canUseDefaultWindowActions = await this.canUseDefaultWindowActions(browserId);
        const customActionsInfo          = await this.hasCustomActionForBrowser(browserId);
        const hasCustomResizeWindow      = customActionsInfo.hasResizeWindow;


        if (canUseDefaultWindowActions && !hasCustomResizeWindow) {
            await this._resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight);
            return;
        }

        await this.plugin.resizeWindow(browserId, width, height, currentWidth, currentHeight);
    }

    public async canResizeWindowToDimensions (browserId: string, width: number, height: number): Promise<boolean> {
        const canUseDefaultWindowActions     = await this.canUseDefaultWindowActions(browserId);
        const customActionsInfo              = await this.hasCustomActionForBrowser(browserId);
        const hasCustomCanResizeToDimensions = customActionsInfo.hasCanResizeWindowToDimensions;


        if (canUseDefaultWindowActions && !hasCustomCanResizeToDimensions)
            return await this._canResizeLocalBrowserWindowToDimensions(browserId, width, height);

        return await this.plugin.canResizeWindowToDimensions(browserId, width, height);
    }

    public async maximizeWindow (browserId: string): Promise<void> {
        const canUseDefaultWindowActions = await this.canUseDefaultWindowActions(browserId);
        const customActionsInfo          = await this.hasCustomActionForBrowser(browserId);
        const hasCustomMaximizeWindow    = customActionsInfo.hasMaximizeWindow;

        if (canUseDefaultWindowActions && !hasCustomMaximizeWindow)
            return await this._maximizeLocalBrowserWindow(browserId);

        return await this.plugin.maximizeWindow(browserId);
    }

    public async takeScreenshot (browserId: string, screenshotPath: string, pageWidth: number, pageHeight: number, fullPage: boolean): Promise<void> {
        const canUseDefaultWindowActions  = await this.canUseDefaultWindowActions(browserId);
        const customActionsInfo           = await this.hasCustomActionForBrowser(browserId);
        const hasCustomTakeScreenshot     = customActionsInfo.hasTakeScreenshot;
        const connection                  = BrowserConnection.getById(browserId) as BrowserConnection;
        const takeLocalBrowsersScreenshot = canUseDefaultWindowActions && !hasCustomTakeScreenshot;
        const isLocalFullPageMode         = takeLocalBrowsersScreenshot && fullPage;

        if (isLocalFullPageMode) {
            connection.addWarning(WARNING_MESSAGE.screenshotsFullPageNotSupported, connection.browserInfo.alias);

            return;
        }

        await makeDir(dirname(screenshotPath));

        if (takeLocalBrowsersScreenshot)
            await this._takeLocalBrowserScreenshot(browserId, screenshotPath);
        else
            await this.plugin.takeScreenshot(browserId, screenshotPath, pageWidth, pageHeight, fullPage);
    }

    public async getVideoFrameData (browserId: string): Promise<any> {
        return this.plugin.getVideoFrameData(browserId);
    }

    public async hasCustomActionForBrowser (browserId: string): Promise<any> {
        return this.plugin.hasCustomActionForBrowser(browserId);
    }

    public async reportJobResult (browserId: string, status: string, data: any): Promise<void> {
        await this.plugin.reportJobResult(browserId, status, data);
    }

    public getActiveWindowId (browserId: string): string | null {
        if (!this.plugin.supportMultipleWindows)
            return null;

        return this.plugin.getActiveWindowId(browserId);
    }

    public setActiveWindowId (browserId: string, val: string): void {
        this.plugin.setActiveWindowId(browserId, val);
    }
}
