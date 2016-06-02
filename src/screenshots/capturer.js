import { join as joinPath, dirname } from 'path';
import promisify from '../utils/promisify';
import mkdirp from 'mkdirp';

var ensureDir = promisify(mkdirp);

const PNG_EXTENSION_RE = /(\.png)$/;


export default class Capturer {
    constructor (baseScreenshotsPath, testScreenshotsPath, testEntry, connection) {
        this.enabled             = !!baseScreenshotsPath;
        this.baseScreenshotsPath = baseScreenshotsPath;
        this.testScreenshotsPath = testScreenshotsPath;
        this.testEntry           = testEntry;
        this.provider            = connection.provider;
        this.id                  = connection.id;
    }

    static _getFileName (stepName) {
        return `${stepName && stepName.replace(/\s|\\|\/|"|\*|\?|<|>|\|/g, '_') || 'page-load'}.png`;
    }

    static _correctFilePath (customPath) {
        return PNG_EXTENSION_RE.test(customPath) ? customPath : `${customPath}.png`;
    }

    async _takeScreenshot (pageInfo, filePath) {
        await ensureDir(dirname(filePath));
        await this.provider.takeScreenshot(this.id, pageInfo, filePath);
    }

    async captureAction ({ pageInfo, stepName, customPath }) {
        if (!this.enabled)
            return null;

        var fileName = Capturer._getFileName(stepName);
        var filePath = null;

        if (customPath) {
            filePath = joinPath(this.baseScreenshotsPath, Capturer._correctFilePath(customPath));

            this.testEntry.path = this.baseScreenshotsPath;
        }
        else
            filePath = joinPath(this.testScreenshotsPath, fileName);

        await this._takeScreenshot(pageInfo, filePath);

        this.testEntry.hasScreenshots = true;

        return filePath;
    }

    async captureError ({ pageInfo, stepName, screenshotRequired }) {
        if (!screenshotRequired || !this.enabled)
            return null;

        var filePath = joinPath(this.testScreenshotsPath, 'errors', Capturer._getFileName(stepName));

        await this._takeScreenshot(pageInfo, filePath);

        return filePath;
    }
}

