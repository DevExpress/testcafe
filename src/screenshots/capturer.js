import { join as joinPath, dirname } from 'path';
import promisify from '../utils/promisify';
import sanitizeFilename from 'sanitize-filename';
import mkdirp from 'mkdirp';
import { generateThumbnail } from 'testcafe-browser-tools';

var ensureDir = promisify(mkdirp);

const PNG_EXTENSION_RE = /(\.png)$/;


export default class Capturer {
    constructor (baseScreenshotsPath, testEntry, connection, namingOptions) {
        this.enabled              = !!baseScreenshotsPath;
        this.baseScreenshotsPath  = baseScreenshotsPath;
        this.testEntry            = testEntry;
        this.provider             = connection.provider;
        this.browserId            = connection.id;
        this.baseDirName          = namingOptions.baseDirName;
        this.userAgentName        = namingOptions.userAgentName;
        this.quarantineAttemptNum = namingOptions.quarantineAttemptNum;
        this.testIndex            = namingOptions.testIndex;
        this.screenshotIndex      = 1;
        this.errorScreenshotIndex = 1;

        var testDirName     = `test-${this.testIndex}`;
        var screenshotsPath = this.enabled ? joinPath(this.baseScreenshotsPath, this.baseDirName, testDirName) : '';

        this.screenshotsPath         = screenshotsPath;
        this.screenshotPathForReport = screenshotsPath;
    }

    static _correctFilePath (path) {
        var correctedPath = path
            .replace(/\\/g, '/')
            .split('/')
            .map(str => sanitizeFilename(str))
            .join('/');

        return PNG_EXTENSION_RE.test(correctedPath) ? correctedPath : `${correctedPath}.png`;
    }

    _getFileName (forError) {
        var fileName = `${forError ? this.errorScreenshotIndex : this.screenshotIndex}.png`;

        if (forError)
            this.errorScreenshotIndex++;
        else
            this.screenshotIndex++;

        return fileName;
    }

    _getSreenshotPath (fileName, customPath) {
        if (customPath)
            return joinPath(this.baseScreenshotsPath, Capturer._correctFilePath(customPath));

        var screenshotPath = this.quarantineAttemptNum !== null ?
                             joinPath(this.screenshotsPath, `run-${this.quarantineAttemptNum}`) :
                             this.screenshotsPath;

        return joinPath(screenshotPath, this.userAgentName, fileName);
    }

    async _takeScreenshot (filePath, pageWidth, pageHeight) {
        await ensureDir(dirname(filePath));
        await this.provider.takeScreenshot(this.browserId, filePath, pageWidth, pageHeight);
    }

    async _capture (forError, pageWidth, pageHeight, customScreenshotPath) {
        if (!this.enabled)
            return null;

        var fileName = this._getFileName(forError);

        fileName = forError ? joinPath('errors', fileName) : fileName;

        var screenshotPath = this._getSreenshotPath(fileName, customScreenshotPath);

        await this._takeScreenshot(screenshotPath, pageWidth, pageHeight);

        await generateThumbnail(screenshotPath);

        // NOTE: if test contains takeScreenshot action with custom path
        // we should specify the most common screenshot folder in report
        if (customScreenshotPath)
            this.screenshotPathForReport = this.baseScreenshotsPath;

        this.testEntry.path = this.screenshotPathForReport;

        return screenshotPath;
    }


    async captureAction ({ pageWidth, pageHeight, customPath }) {
        return await this._capture(false, pageWidth, pageHeight, customPath);
    }

    async captureError ({ pageWidth, pageHeight }) {
        return await this._capture(true, pageWidth, pageHeight);
    }
}

