import Promise from 'pinkie';
import browserTools from 'testcafe-browser-tools';
import OS from 'os-family';
import delay from '../../utils/delay';


/*eslint-disable no-undef*/
function getTitle () {
    return document.title;
}

function getWindowDimensionsInfo () {
    return {
        width:           window.innerWidth,
        height:          window.innerHeight,
        outerWidth:      window.outerWidth,
        outerHeight:     window.outerHeight,
        availableWidth:  screen.availWidth,
        availableHeight: screen.availHeight
    };
}
/*eslint-disable no-undef*/

const GET_TITLE_SCRIPT                  = getTitle.toString();
const GET_WINDOW_DIMENSIONS_INFO_SCRIPT = getWindowDimensionsInfo.toString();

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
        this.plugin            = plugin;
        this.initPromise       = Promise.resolve(false);

        this.isMultiBrowser    = this.plugin.isMultiBrowser;
        // HACK: The browser window has different border sizes in normal and maximized modes. So, we need to be sure that the window is
        // not maximized before resizing it in order to keep the mechanism of correcting the client area size working. When browser is started,
        // we are resizing it for the first time to switch the window to normal mode, and for the second time - to restore the client area size.
        this.resizeCorrections = {};
        this.maxScreenSizes    = {};
    }

    async _calculateResizeCorrections (browserId) {
        // NOTE: delay to ensure the window finished the opening
        await this.plugin.waitForConnectionReady(browserId);
        await delay(BROWSER_OPENING_DELAY);

        var title = await this.plugin.runInitScript(browserId, GET_TITLE_SCRIPT);

        if (!await browserTools.isMaximized(title))
            return;

        var currentSize = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        var etalonSize  = subtractSizes(currentSize, RESIZE_DIFF_SIZE);

        await browserTools.resize(title, currentSize.width, currentSize.height, etalonSize.width, etalonSize.height);

        var resizedSize    = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        var correctionSize = subtractSizes(resizedSize, etalonSize);

        await browserTools.resize(title, resizedSize.width, resizedSize.height, etalonSize.width, etalonSize.height);

        resizedSize = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

        correctionSize = sumSizes(correctionSize, subtractSizes(resizedSize, etalonSize));

        this.resizeCorrections[browserId] = correctionSize;

        await browserTools.maximize(title);
    }

    async _calculateMacSizeLimits (browserId) {
        await this.plugin.waitForConnectionReady(browserId);
        await delay(BROWSER_OPENING_DELAY);

        var sizeInfo = await this.plugin.runInitScript(browserId, GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

        this.maxScreenSizes[browserId] = {
            width:  sizeInfo.availableWidth - (sizeInfo.outerWidth - sizeInfo.width),
            height: sizeInfo.availableHeight - (sizeInfo.outerHeight - sizeInfo.height)
        };
    }

    async _onOpenBrowser (browserId) {
        if (OS.win)
            await this._calculateResizeCorrections(browserId);
        else if (OS.mac)
            await this._calculateMacSizeLimits(browserId);
    }

    async _closeLocalBrowser (browserId) {
        await browserTools.close(browserId);
    }

    async _resizeLocalBrowserWindow (browserId, width, height, currentWidth, currentHeight) {
        if (this.resizeCorrections[browserId]) {
            width -= this.resizeCorrections[browserId].width;
            height -= this.resizeCorrections[browserId].height;

            delete this.resizeCorrections[browserId];
        }

        await browserTools.resize(browserId, currentWidth, currentHeight, width, height);
    }

    async _takeLocalBrowserScreenshot (browserId, screenshotPath) {
        await browserTools.screenshot(browserId, screenshotPath);
    }

    async _canResizeLocalBrowserWindowToDimensions (browserId, width, height) {
        if (!OS.mac)
            return true;

        var maxScreenSize = this.maxScreenSizes[browserId];

        return width <= maxScreenSize.width && height <= maxScreenSize.height;
    }

    async _maximizeLocalBrowserWindow (browserId) {
        await browserTools.maximize(browserId);
    }

    async init () {
        var initialized = await this.initPromise;

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
        var initialized = await this.initPromise;

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

    async openBrowser (browserId, pageUrl, browserName) {
        await this.plugin.openBrowser(browserId, pageUrl, browserName);

        var isLocalBrowser = await this.plugin.isLocalBrowser(browserId);

        if (isLocalBrowser)
            await this._onOpenBrowser(browserId);
    }

    async closeBrowser (browserId) {
        await this.plugin.closeBrowser(browserId);
    }

    async getBrowserList () {
        return await this.plugin.getBrowserList();
    }

    async isValidBrowserName (browserName) {
        return await this.plugin.isValidBrowserName(browserName);
    }

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        var isLocalBrowser    = await this.plugin.isLocalBrowser(browserId);
        var supportedFeatures = await this.plugin.hasCustomActionForBrowser(browserId);

        if (isLocalBrowser && !supportedFeatures.hasResizeWindow) {
            await this._resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight);
            return;
        }

        await this.plugin.resizeWindow(browserId, width, height, currentWidth, currentHeight);
    }

    async canResizeWindowToDimensions (browserId, width, height) {
        var isLocalBrowser    = await this.plugin.isLocalBrowser(browserId);
        var supportedFeatures = await this.plugin.hasCustomActionForBrowser(browserId);

        if (isLocalBrowser && !supportedFeatures.hasCanResizeWindowToDimensions)
            return await this._canResizeLocalBrowserWindowToDimensions(browserId, width, height);

        return await this.plugin.canResizeWindowToDimensions(browserId, width, height);
    }

    async maximizeWindow (browserId) {
        var isLocalBrowser    = await this.plugin.isLocalBrowser(browserId);
        var supportedFeatures = await this.plugin.hasCustomActionForBrowser(browserId);

        if (isLocalBrowser && !supportedFeatures.hasCanResizeWindowToDimensions)
            return await this._maximizeLocalBrowserWindow(browserId);

        return await this.plugin.maximizeWindow(browserId);
    }

    async takeScreenshot (browserId, screenshotPath, pageWidth, pageHeight) {
        var isLocalBrowser    = await this.plugin.isLocalBrowser(browserId);
        var supportedFeatures = await this.plugin.hasCustomActionForBrowser(browserId);

        if (isLocalBrowser && !supportedFeatures.hasTakeScreenshot) {
            await this._takeLocalBrowserScreenshot(browserId, screenshotPath, pageWidth, pageHeight);
            return;
        }

        await this.plugin.takeScreenshot(browserId, screenshotPath, pageWidth, pageHeight);
    }

    async reportJobResult (browserId, status, data) {
        await this.plugin.reportJobResult(browserId, status, data);
    }
}
