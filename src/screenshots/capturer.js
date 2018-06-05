import { join as joinPath, dirname, basename } from 'path';
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
        this.baseDirName          = namingOptions.baseDirName;
        this.userAgentName        = namingOptions.userAgentName;
        this.quarantine           = namingOptions.quarantine;
        this.attemptNumber        = this.quarantine ? this.quarantine.attemptNumber : null;
        this.testIndex            = namingOptions.testIndex;
        this.screenshotIndex      = 1;
        this.errorScreenshotIndex = 1;
        this.warningLog           = warningLog;

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

    _getFileName (forError) {
        var fileName = `${forError ? this.errorScreenshotIndex : this.screenshotIndex}.png`;

        if (forError)
            this.errorScreenshotIndex++;
        else
            this.screenshotIndex++;

        return fileName;
    }

    _getScreenshotPath (fileName, customPath) {
        if (customPath)
            return joinPath(this.baseScreenshotsPath, Capturer._correctFilePath(customPath));

        var screenshotPath = this.attemptNumber !== null ?
            joinPath(this.screenshotsPath, `run-${this.attemptNumber}`) : this.screenshotsPath;

        return joinPath(screenshotPath, this.userAgentName, fileName);
    }

    _getThumbnailPath (screenshotPath) {
        var imageName = basename(screenshotPath);
        var imageDir  = dirname(screenshotPath);

        return joinPath(imageDir, 'thumbnails', imageName);
    }

    async _takeScreenshot (filePath, pageWidth, pageHeight) {
        await ensureDir(dirname(filePath));
        await this.provider.takeScreenshot(this.browserId, filePath, pageWidth, pageHeight);
    }

    async _capture (forError, { pageDimensions, cropDimensions, markSeed, customPath } = {}) {
        if (!this.enabled)
            return null;

        var fileName = this._getFileName(forError);

        fileName = forError ? joinPath('errors', fileName) : fileName;

        var screenshotPath = this._getScreenshotPath(fileName, customPath);
        var thumbnailPath  = this._getThumbnailPath(screenshotPath);

        if (isInQueue(screenshotPath))
            this.warningLog.addWarning(WARNING_MESSAGE.screenshotRewritingError, screenshotPath);

        await addToQueue(screenshotPath, async () => {
            await this._takeScreenshot(screenshotPath, ... pageDimensions ? [pageDimensions.innerWidth, pageDimensions.innerHeight] : []);

            await cropScreenshot(screenshotPath, markSeed, Capturer._getClientAreaDimensions(pageDimensions), Capturer._getCropDimensions(cropDimensions, pageDimensions));

            await generateThumbnail(screenshotPath, thumbnailPath);
        });

        // NOTE: if test contains takeScreenshot action with custom path
        // we should specify the most common screenshot folder in report
        if (customPath)
            this.screenshotPathForReport = this.baseScreenshotsPath;

        this.testEntry.path = this.screenshotPathForReport;

        const isFailed = () => {
            return this.quarantine && this.quarantine.isFailedAttempt(this.attemptNumber);
        };

        const screenshot = {
            screenshotPath,
            thumbnailPath,
            userAgent: this.userAgentName,
            forError,
            get isFailed () {
                return isFailed();
            }
        };

        this.testEntry.screenshots.push(screenshot);

        return screenshotPath;
    }


    async captureAction (options) {
        return await this._capture(false, options);
    }

    async captureError (options) {
        return await this._capture(true, options);
    }
}

