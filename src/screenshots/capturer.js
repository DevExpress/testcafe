import { join as joinPath, dirname } from 'path';
import promisify from '../utils/promisify';
import sanitizeFilename from 'sanitize-filename';
import mkdirp from 'mkdirp';
import { generateThumbnail } from 'testcafe-browser-tools';
import { linux } from 'os-family';

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
        this.testDirName          = Capturer._getTestDirName(namingOptions.testIndex, namingOptions.quarantineAttemptNum);
        this.screenshotIndex      = 1;
        this.errorScreenshotIndex = 1;
        this.pathCustomized       = false;
    }

    static _correctFilePath (path) {
        var correctedPath = path
            .split('/')
            .map(str => sanitizeFilename(str))
            .join('/');

        return PNG_EXTENSION_RE.test(correctedPath) ? correctedPath : `${correctedPath}.png`;
    }

    static _getTestDirName (testIndex, quarantineAttemptNum) {
        var quarantineAttemptPostfix = quarantineAttemptNum > 0 ? `-${quarantineAttemptNum}` : ``;

        return `test-${testIndex}${quarantineAttemptPostfix}`;
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
        var pathForReport  = this.baseScreenshotsPath;
        var screenshotPath = null;

        if (customPath) {
            this.pathCustomized = true;
            screenshotPath      = joinPath(this.baseScreenshotsPath, Capturer._correctFilePath(customPath));
        }
        else {
            var path = joinPath(this.baseScreenshotsPath, this.baseDirName, this.testDirName);

            // NOTE: if test contains takeScreenshot action with custom path
            // we should specify the most common screenshot folder in report
            if (!this.pathCustomized)
                pathForReport = path;

            screenshotPath = joinPath(path, this.userAgentName, fileName);
        }

        return { pathForReport, screenshotPath };
    }

    async _takeScreenshot (filePath, pageWidth, pageHeight) {
        await ensureDir(dirname(filePath));
        await this.provider.takeScreenshot(this.browserId, filePath, pageWidth, pageHeight);
    }

    async captureAction ({ customPath, pageWidth, pageHeight }) {
        if (!this.enabled)
            return null;

        var fileName = this._getFileName(false);
        var { pathForReport, screenshotPath } = this._getSreenshotPath(fileName, customPath);

        this.testEntry.path = pathForReport;

        await this._takeScreenshot(screenshotPath, pageWidth, pageHeight);

        this.testEntry.hasScreenshots = true;

        // NOTE: generateThumbnail is not available on Linux yet. Keep tracking the https://github.com/DevExpress/testcafe-browser-tools/issues/12
        if (!linux)
            await generateThumbnail(screenshotPath);

        return screenshotPath;
    }

    async captureError ({ screenshotRequired, pageWidth, pageHeight }) {
        if (!screenshotRequired || !this.enabled)
            return null;

        var fileName = this._getFileName(true);
        var { screenshotPath } = this._getSreenshotPath(joinPath('errors', fileName));

        await this._takeScreenshot(screenshotPath, pageWidth, pageHeight);

        // NOTE: generateThumbnail is not available on Linux yet. Keep tracking the https://github.com/DevExpress/testcafe-browser-tools/issues/12
        if (!linux)
            await generateThumbnail(screenshotPath);

        return screenshotPath;
    }
}

