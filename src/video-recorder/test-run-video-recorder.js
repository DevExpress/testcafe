import { join } from 'path';
import VideoRecorderProcess from './process';

const VIDEO_EXTENSION = 'mp4';

const TEMP_VIDEO_FILE_PREFIX = 'tmp-video';
const TEMP_MERGE_FILE_PREFIX = TEMP_VIDEO_FILE_PREFIX + '-merge';

const TEMP_MERGE_CONFIG_FILE_PREFIX    = 'config';
const TEMP_MERGE_CONFIG_FILE_EXTENSION = 'txt';

export default class TestRunVideoRecorder {
    constructor ({ testRun, test, index }, { path, ffmpegPath, encodingOptions }) {
        this.testRun    = testRun;
        this.test       = test;
        this.index      = index;

        this.tempFiles     = null;
        this.videoRecorder = null;

        this.path            = path;
        this.ffmpegPath      = ffmpegPath;
        this.encodingOptions = encodingOptions;
    }

    get testRunInfo () {
        return {
            testIndex:       this.index,
            fixture:         this.test.fixture.name,
            test:            this.test.name,
            alias:           this._connection.browserInfo.alias,
            parsedUserAgent: this._connection.browserInfo.parsedUserAgent
        };
    }

    get hasErrors () {
        return !!this.testRun.errs.length;
    }

    get _connection () {
        return this.testRun.browserConnection;
    }

    async startCapturing () {
        await this.videoRecorder.startCapturing();
    }

    async finishCapturing () {
        await this.videoRecorder.finishCapturing();
    }

    async init () {
        this.tempFiles     = this._generateTempNames();
        this.videoRecorder = this._createVideoRecorderProcess();

        await this.videoRecorder.init();
    }

    async isVideoSupported () {
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

