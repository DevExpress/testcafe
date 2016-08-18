import browserNatives from 'testcafe-browser-natives';
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

    async calculateResizeCorrections (id) {
        await this.waitForConnectionReady(id);

        var { width, height, title } = await this.runInitScript(id, INIT_SCRIPT);

        if (!await browserNatives.isMaximized(title))
            return;

        await browserNatives.resize(title, width, height, width, height);

        var { width: newWidth, height: newHeight } = await this.runInitScript(id, INIT_SCRIPT);

        await browserNatives.maximize(title);

        if (newWidth === width && newHeight === height)
            return;

        this.resizeCorrections[id] = { width: newWidth - width, height: newHeight - height };
    }

    async resizeWindow (browserId, width, height, currentWidth, currentHeight) {
        // TODO: remove once https://github.com/DevExpress/testcafe-browser-natives/issues/12 implemented
        if (OS.linux) {
            this.reportWarning(id, WARNING_MESSAGE.browserManipulationsNotSupportedOnLinux);
            return;
        }

        if (this.resizeCorrections[id]) {
            width -= this.resizeCorrections[id].width;
            height -= this.resizeCorrections[id].height;

            delete this.resizeCorrections[id];
        }

        await browserNatives.resize(id, currentWidth, currentHeight, width, height);
    }

    async takeScreenshot (browserId, screenshotPath) {
        // TODO: remove once https://github.com/DevExpress/testcafe-browser-natives/issues/12 implemented
        if (OS.linux) {
            this.reportWarning(id, WARNING_MESSAGE.browserManipulationsNotSupportedOnLinux);
            return;
        }

        await browserNatives.screenshot(id, screenshotPath);
    }
}
