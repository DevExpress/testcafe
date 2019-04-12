import { join } from 'path';

import VideoRecorderProcess from './process';

import WARNING_MESSAGES from '../notifications/warning-message';

const VIDEO_EXTENSION = 'mp4';

const TEMP_VIDEO_FILE_PREFIX = 'tmp-video';
const TEMP_MERGE_FILE_PREFIX = TEMP_VIDEO_FILE_PREFIX + '-merge';

const TEMP_MERGE_CONFIG_FILE_PREFIX    = 'config';
const TEMP_MERGE_CONFIG_FILE_EXTENSION = 'txt';

export default class TestRunRecorder {
    constructor ({ testRun, test, index }, { path, ffmpegPath, encodingOptions }, warningLog) {
        this.testRun    = testRun;
        this.test       = test;
        this.index      = index;

        this.tempFiles     = null;
        this.videoRecorder = null;

        this.path            = path;
        this.ffmpegPath      = ffmpegPath;
        this.encodingOptions = encodingOptions;

        this.warningLog = warningLog;
    }

    get testInfo () {
        return {
            testIndex:       this.index,
            fixture:         this.test.fixture.name,
            test:            this.test.name,
            parsedUserAgent: this._connection.browserInfo.parsedUserAgent
        };
    }

    get hasErrors () {
        return !!this.testRun.errs.length;
    }

    get _connection () {
        return this.testRun.browserConnection;
    }

    get _browserAlias () {
        return this._connection.browserInfo.alias;
    }

    async startCapturing () {
        await this.videoRecorder.startCapturing();
    }

    async finishCapturing () {
        if (this.testRun.browserResized)
            this.warningLog.addWarning(WARNING_MESSAGES.videoBrowserResizing, this.testRun.test.name);

        await this.videoRecorder.finishCapturing();
    }

    async init () {
        const isVideoSupported = await this._isVideoSupported();

        if (isVideoSupported) {
            this.tempFiles = this._generateTempNames();

            this.videoRecorder = this._createVideoRecorderProcess();

            await this.videoRecorder.init();
        }
        else
            this.warningLog.addWarning(WARNING_MESSAGES.videoNotSupportedByBrowser, this._browserAlias);
    }

    async _isVideoSupported () {
        const connectionCapabilities = await this._connection.provider.hasCustomActionForBrowser(this._connection.id);

        return connectionCapabilities && connectionCapabilities.hasGetVideoFrameData;
    }

    _createVideoRecorderProcess () {
        return new VideoRecorderProcess(this.tempFiles.tempVideoPath, this.ffmpegPath, this._connection, this.encodingOptions);
    }

    _generateTempNames () {
        const id = this._connection.id;

        const tempFileNames = {
            tempVideoPath:       `${TEMP_VIDEO_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`,
            tempMergeConfigPath: `${TEMP_MERGE_CONFIG_FILE_PREFIX}-${id}.${TEMP_MERGE_CONFIG_FILE_EXTENSION}`,
            tmpMergeName:        `${TEMP_MERGE_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`
        };

        for (const [tempFile, tempName] of Object.entries(tempFileNames))
            tempFileNames[tempFile] = join(this.path, tempName);

        return tempFileNames;
    }
}

