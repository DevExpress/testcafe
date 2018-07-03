import { join as joinPath, dirname, basename } from 'path';
import { generateThumbnail } from 'testcafe-browser-tools';
import cropScreenshot from './crop';
import { ensureDir } from '../utils/promisified-functions';
import { isInQueue, addToQueue } from '../utils/async-queue';
import WARNING_MESSAGE from '../notifications/warning-message';
import correctFilePath from '../utils/correct-file-path';

export default class Capturer {
    constructor (baseScreenshotsPath, testEntry, connection, pathPattern, warningLog) {
        this.enabled             = !!baseScreenshotsPath;
        this.baseScreenshotsPath = baseScreenshotsPath;
        this.testEntry           = testEntry;
        this.provider            = connection.provider;
        this.browserId           = connection.id;
        this.warningLog          = warningLog;
        this.pathPattern         = pathPattern;
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

    _joinWithBaseScreenshotPath (path) {
        return joinPath(this.baseScreenshotsPath, path);
    }

    _updateScreenshotPathForTestEntry (customPath) {
        // NOTE: if test contains takeScreenshot action with custom path
        // we should specify the most common screenshot folder in report
        let screenshotPathForTestEntry = this.baseScreenshotsPath;

        if (!customPath) {
            const pathForReport = this.pathPattern.getPathForReport();

            screenshotPathForTestEntry = this._joinWithBaseScreenshotPath(pathForReport);
        }


        this.testEntry.path = screenshotPathForTestEntry;
    }

    _incrementFileIndexes (forError) {
        if (forError)
            this.pathPattern.data.errorFileIndex++;

        else
            this.pathPattern.data.fileIndex++;
    }

    _getCustomScreenshotPath (customPath) {
        return this._joinWithBaseScreenshotPath(customPath);
    }

    _getScreenshotPath (forError) {
        const path = this.pathPattern.getPath(forError);

        this._incrementFileIndexes(forError);

        return this._joinWithBaseScreenshotPath(path);
    }

    _getThumbnailPath (screenshotPath) {
        const imageName = basename(screenshotPath);
        const imageDir  = dirname(screenshotPath);

        return joinPath(imageDir, 'thumbnails', imageName);
    }

    async _takeScreenshot (filePath, pageWidth, pageHeight) {
        await ensureDir(dirname(filePath));
        await this.provider.takeScreenshot(this.browserId, filePath, pageWidth, pageHeight);
    }

    async _capture (forError, { pageDimensions, cropDimensions, markSeed, customPath } = {}) {
        if (!this.enabled)
            return null;

        const screenshotPath = customPath ? this._getCustomScreenshotPath(customPath) : this._getScreenshotPath(forError);
        const thumbnailPath  = this._getThumbnailPath(screenshotPath);

        if (isInQueue(screenshotPath))
            this.warningLog.addWarning(WARNING_MESSAGE.screenshotRewritingError, screenshotPath);

        await addToQueue(screenshotPath, async () => {
            await this._takeScreenshot(screenshotPath, ... pageDimensions ? [pageDimensions.innerWidth, pageDimensions.innerHeight] : []);

            await cropScreenshot(screenshotPath, markSeed, Capturer._getClientAreaDimensions(pageDimensions), Capturer._getCropDimensions(cropDimensions, pageDimensions));

            await generateThumbnail(screenshotPath, thumbnailPath);
        });

        this._updateScreenshotPathForTestEntry(customPath);

        const screenshot = {
            screenshotPath,
            thumbnailPath,
            userAgent:           this.pathPattern.data.parsedUserAgent.toString(),
            quarantineAttemptID: this.pathPattern.data.quarantineAttempt,
            takenOnFail:         forError,
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

