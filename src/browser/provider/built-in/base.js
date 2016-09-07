import browserTools from 'testcafe-browser-tools';
import OS from 'os-family';
import WARNING_MESSAGE from '../../../warnings/message';
import delay from '../../../utils/delay';


/*eslint-disable no-undef*/
function getTitle () {
    return document.title;
}

function getCurrentSize () {
    return {
        width:  window.innerWidth,
        height: window.innerHeight,
    };
}
/*eslint-disable no-undef*/

const GET_TITLE_SCRIPT        = getTitle.toString();
const GET_CURRENT_SIZE_SCRIPT = getCurrentSize.toString();

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

export default class BrowserProviderBase {
    constructor () {
        // HACK: The browser window has different border sizes in normal and maximized modes. So, we need to be sure that the window is
        // not maximized before resizing it in order to keep the mechanism of correcting the client area size working. When browser is started,
        // we are resizing it for the first time to switch the window to normal mode, and for the second time - to restore the client area size.

        this.resizeCorrections = {};
    }

    async calculateResizeCorrections (browserId) {
        // NOTE: delay to ensure the window finished the opening
        await this.waitForConnectionReady(browserId);
        await delay(BROWSER_OPENING_DELAY);

        var title = await this.runInitScript(browserId, GET_TITLE_SCRIPT);

        if (!await browserTools.isMaximized(title))
            return;

        var currentSize = await this.runInitScript(browserId, GET_CURRENT_SIZE_SCRIPT);
        var etalonSize  = subtractSizes(currentSize, RESIZE_DIFF_SIZE);

        await browserTools.resize(title, currentSize.width, currentSize.height, etalonSize.width, etalonSize.height);

        var resizedSize     = await this.runInitScript(browserId, GET_CURRENT_SIZE_SCRIPT);
        var correctionSize  = subtractSizes(resizedSize, etalonSize);

        await browserTools.resize(title, resizedSize.width, resizedSize.height, etalonSize.width, etalonSize.height);

        resizedSize = await this.runInitScript(browserId, GET_CURRENT_SIZE_SCRIPT);

        correctionSize = sumSizes(correctionSize, subtractSizes(resizedSize, etalonSize));

        this.resizeCorrections[browserId] = correctionSize;

        await browserTools.maximize(title);
    }

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        // TODO: remove once https://github.com/DevExpress/testcafe-browser-tools/issues/12 implemented
        if (OS.linux) {
            this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsNotSupportedOnLinux);
            return;
        }

        if (this.resizeCorrections[browserId]) {
            width -= this.resizeCorrections[browserId].width;
            height -= this.resizeCorrections[browserId].height;

            delete this.resizeCorrections[browserId];
        }

        await browserTools.resize(browserId, currentWidth, currentHeight, width, height);
    }

    async takeScreenshot (browserId, screenshotPath) {
        // TODO: remove once https://github.com/DevExpress/testcafe-browser-tools/issues/12 implemented
        if (OS.linux) {
            this.reportWarning(browserId, WARNING_MESSAGE.browserManipulationsNotSupportedOnLinux);
            return;
        }

        await browserTools.screenshot(browserId, screenshotPath);
    }
}
