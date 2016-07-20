import { join as joinPath, dirname } from 'path';
import promisify from '../../utils/promisify';
import mkdirp from 'mkdirp';
import { screenshot as takeScreenshot } from 'testcafe-browser-natives';

var ensureDir = promisify(mkdirp);


export default class Capturer {
    constructor (baseScreenshotsPath, testScreenshotsPath, testEntry) {
        this.enabled             = !!baseScreenshotsPath;
        this.baseScreenshotsPath = baseScreenshotsPath;
        this.testScreenshotsPath = testScreenshotsPath;
        this.testEntry           = testEntry;
    }

    static _getFileName (stepName) {
        return `${stepName && stepName.replace(/\s|\\|\/|"|\*|\?|<|>|\|/g, '_') || 'page-load'}.png`;
    }

    async _takeScreenshot (windowId, filePath) {
        await ensureDir(dirname(filePath));
        await takeScreenshot(windowId, filePath);
    }

    async captureAction (windowId, { stepName, customPath }) {
        if (!this.enabled)
            return null;

        var fileName = Capturer._getFileName(stepName);
        var filePath = customPath ? joinPath(this.baseScreenshotsPath, customPath, fileName) :
                       joinPath(this.testScreenshotsPath, fileName);

        if (customPath)
            this.testEntry.path = this.baseScreenshotsPath;

        await this._takeScreenshot(windowId, filePath);

        this.testEntry.hasScreenshots = true;

        return filePath;
    }

    async captureError (windowId, { stepName, screenshotRequired }) {
        if (!screenshotRequired || !this.enabled)
            return null;

        var filePath = joinPath(this.testScreenshotsPath, 'errors', Capturer._getFileName(stepName));

        await this._takeScreenshot(windowId, filePath);

        return filePath;
    }
}

