import { join as joinPath, dirname } from 'path';
import sanitizeFilename from 'sanitize-filename';
import { generateThumbnail } from 'testcafe-browser-tools';
import cropScreenshot from './crop';
import { ensureDir } from '../utils/promisified-functions';
import { isInQueue, addToQueue } from '../utils/async-queue';
import WARNING_MESSAGE from '../notifications/warning-message';


const PNG_EXTENSION_RE = /(\.png)$/;


export default class Capturer {
    constructor (baseScreenshotsPath, testEntry, connection, namingOptions, warningLog) {
        this.enabled              = !!baseScreenshotsPath;
        this.baseScreenshotsPath  = baseScreenshotsPath;
        this.testEntry            = testEntry;
        this.provider             = connection.provider;
        this.browserId            = connection.id;
        this.quarantineAttemptNum = namingOptions.quarantineAttemptNum;
        this.testIndex            = namingOptions.testIndex;
        this.screenshotIndex      = 1;
        this.errorScreenshotIndex = 1;
        this.warningLog           = warningLog;

        var screenshotsPath = this.enabled ? this.baseScreenshotsPath : '';

        this.screenshotsPath         = screenshotsPath;
        this.screenshotPathForReport = screenshotsPath;
        this.screenshotsPatternName  = namingOptions.patternName;

        this.patternMap = namingOptions.patternMap;
    }

    static _correctFilePath (path) {
        var correctedPath = path
            .replace(/\\/g, '/')
            .split('/')
            .map(str => sanitizeFilename(str))
            .join('/');

        return PNG_EXTENSION_RE.test(correctedPath) ? correctedPath : `${correctedPath}.png`;
    }

    static _getDimensionWithoutScrollbar (fullDimension, documentDimension, bodyDimension) {
        if (bodyDimension > fullDimension)
            return documentDimension;

        if (documentDimension > fullDimension)
            return bodyDimension;

        return Math.max(documentDimension, bodyDimension);
    }

    static _getCropDimensions (cropDimensions, pageDimensions) {
        if (!cropDimensions || !pageDimensions)
            return null;

        const { dpr }                      = pageDimensions;
        const { top, left, bottom, right } = cropDimensions;

        return {
            top:    Math.round(top * dpr),
            left:   Math.round(left * dpr),
            bottom: Math.round(bottom * dpr),
            right:  Math.round(right * dpr)
        };
    }

    static _getClientAreaDimensions (pageDimensions) {
        if (!pageDimensions)
            return null;

        const { innerWidth, documentWidth, bodyWidth, innerHeight, documentHeight, bodyHeight, dpr } = pageDimensions;

        return {
            width:  Math.floor(Capturer._getDimensionWithoutScrollbar(innerWidth, documentWidth, bodyWidth) * dpr),
            height: Math.floor(Capturer._getDimensionWithoutScrollbar(innerHeight, documentHeight, bodyHeight) * dpr)
        };
    }

    _parseFileNumber (fileName) {
        if (fileName.indexOf('%FILENUMBER%') !== -1)
            return fileName.replace(new RegExp('%FILENUMBER%', 'g'), (this.screenshotIndex - 1).toString().padStart(3, 0));

        return fileName;
    }

    _getFileName (forError) {
        let fileName = '';

        if (this.screenshotsPatternName)
            fileName = `${this.screenshotsPatternName}.png`;
        else
            fileName = `${forError ? this.errorScreenshotIndex : this.screenshotIndex}.png`;

        if (forError)
            this.errorScreenshotIndex++;
        else
            this.screenshotIndex++;

        return fileName;
    }

    _parsePattern (namePattern) {
        for (const pattern in this.patternMap)
            namePattern = namePattern.replace(new RegExp(`%${pattern}%`, 'g'), this.patternMap[pattern]);

        return namePattern;
    }

    _getSreenshotPath (fileName, customPath) {
        if (customPath)
            return joinPath(this.baseScreenshotsPath, Capturer._correctFilePath(this._parsePattern(customPath)));

        var screenshotPath = this.quarantineAttemptNum !== null ?
            joinPath(this.screenshotsPath, `run-${this.quarantineAttemptNum}`) :
            this.screenshotsPath;

        return joinPath(screenshotPath, fileName);
    }

    async _takeScreenshot (filePath, pageWidth, pageHeight) {
        await ensureDir(dirname(filePath));
        await this.provider.takeScreenshot(this.browserId, filePath, pageWidth, pageHeight);
    }

    async _capture (forError, { pageDimensions, cropDimensions, markSeed, customPath } = {}) {
        if (!this.enabled)
            return null;

        var fileName = this._parseFileNumber(this._getFileName(forError));

        fileName = forError ? joinPath('errors', fileName) : fileName;

        var screenshotPath = this._getScreenshotPath(fileName, customPath);

        if (isInQueue(screenshotPath))
            this.warningLog.addWarning(WARNING_MESSAGE.screenshotRewritingError, screenshotPath);

        await addToQueue(screenshotPath, async () => {
            await this._takeScreenshot(screenshotPath, ... pageDimensions ? [pageDimensions.innerWidth, pageDimensions.innerHeight] : []);

            await cropScreenshot(screenshotPath, markSeed, Capturer._getClientAreaDimensions(pageDimensions), Capturer._getCropDimensions(cropDimensions, pageDimensions));

            await generateThumbnail(screenshotPath);
        });

        // NOTE: if test contains takeScreenshot action with custom path
        // we should specify the most common screenshot folder in report
        if (customPath)
            this.screenshotPathForReport = this.baseScreenshotsPath;

        this.testEntry.hasScreenshots = true;
        this.testEntry.path           = this.screenshotPathForReport;

        return screenshotPath;
    }

    async captureAction (options) {
        return await this._capture(false, options);
    }

    async captureError (options) {
        return await this._capture(true, options);
    }
}

