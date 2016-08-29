import browserTools from 'testcafe-browser-tools';
import OS from 'os-family';
import WARNING_MESSAGE from '../../../warnings/message';


/*eslint-disable no-undef*/
function getDataFromBrowser () {
    return { width: window.innerWidth, height: window.innerHeight, title: document.title };
}
/*eslint-disable no-undef*/

const INIT_SCRIPT = getDataFromBrowser.toString();


export default class BrowserProviderBase {
    constructor () {
        // HACK: The browser window has different border sizes in normal and maximized modes. So, we need to be sure that the window is
        // not maximized before resizing it in order to keep the mechanism of correcting the client area size working. When browser is started,
        // we are resizing it for the first time to switch the window to normal mode, and for the second time - to restore the client area size.

        this.resizeCorrections = {};
    }

    async calculateResizeCorrections (browserId) {
        await this.waitForConnectionReady(browserId);

        var { width, height, title } = await this.runInitScript(browserId, INIT_SCRIPT);

        if (!await browserTools.isMaximized(title))
            return;

        await browserTools.resize(title, width, height, width, height);

        var { width: newWidth, height: newHeight } = await this.runInitScript(browserId, INIT_SCRIPT);

        await browserTools.maximize(title);

        if (newWidth === width && newHeight === height)
            return;

        this.resizeCorrections[browserId] = { width: newWidth - width, height: newHeight - height };
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
