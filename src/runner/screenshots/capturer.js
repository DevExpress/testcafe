import { join as joinPath, dirname } from 'path';
import promisify from '../../utils/promisify';
import mkdirp from 'mkdirp';
import { screenshot as takeScreenshot } from 'testcafe-browser-natives';

var ensureDir = promisify(mkdirp);


export default class Capturer {
    constructor (screenshotPath, testDirPath, testEntry) {
        this.enabled     = !!screenshotPath;
        this.path        = screenshotPath;
        this.testDirPath = testDirPath;
        this.testEntry   = testEntry;
    }

    static _getFileName (stepName) {
        return `${stepName && stepName.replace(/\s|\\|\/|"|\*|\?|<|>|\|/g, '_') || 'Page_Load'}.png`;
    }

    async _takeScreenshot (url, filePath) {
        await ensureDir(dirname(filePath));
        await takeScreenshot(url, filePath);

        this.testEntry.hasScreenshots = true;

        return filePath;
    }

    async captureAction ({ pageUrl, stepName, customPath }) {
        var fileName = Capturer._getFileName(stepName);
        var filePath = customPath ?
                       joinPath(this.testDirPath, customPath, fileName) :
                       joinPath(this.path, fileName);

        return await this._takeScreenshot(pageUrl, filePath);
    }

    async captureError ({ pageUrl, stepName, screenshotRequired }) {
        if (!screenshotRequired)
            return null;

        var filePath = joinPath(this.path, 'errors', Capturer._getFileName(stepName));

        return await this._takeScreenshot(pageUrl, filePath);
    }
}

