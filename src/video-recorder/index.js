import debug from 'debug';
import { join, dirname } from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import makeDir from 'make-dir';
import VideoRecorderProcess from './process';
import TempDirectory from '../utils/temp-directory';
import PathPattern from '../utils/path-pattern';
import WARNING_MESSAGES from '../notifications/warning-message';


const DEBUG_LOGGER = debug('testcafe:video-recorder');

const VIDEO_EXTENSION = 'mp4';

const TEMP_DIR_PREFIX        = 'video';
const TEMP_VIDEO_FILE_PREFIX = 'tmp-video';
const TEMP_MERGE_FILE_PREFIX = TEMP_VIDEO_FILE_PREFIX + '-merge';

const TEMP_MERGE_CONFIG_FILE_PREFIX    = 'config';
const TEMP_MERGE_CONFIG_FILE_EXTENSION = 'txt';

export default class VideoRecorder {
    constructor (browserJob, basePath, opts, encodingOpts) {
        this.browserJob        = browserJob;
        this.basePath          = basePath;
        this.failedOnly        = opts.failedOnly;
        this.singleFile        = opts.singleFile;
        this.ffmpegPath        = opts.ffmpegPath;
        this.customPathPattern = opts.pathPattern;
        this.timeStamp         = opts.timeStamp;
        this.encodingOptions   = encodingOpts;

        this.tempDirectory       = new TempDirectory(TEMP_DIR_PREFIX);
        this.tempVideoPath       = '';
        this.tempMergeConfigPath = '';

        this.firstFile = true;

        this.testRunInfo = {};

        this._assignEventHandlers(browserJob);
    }

    _createSafeListener (listener) {
        return async (...args) => {
            try {
                return await listener.apply(this, args);
            }
            catch (error) {
                DEBUG_LOGGER(listener && listener.name, error);

                return void 0;
            }
        };
    }

    _assignEventHandlers (browserJob) {
        browserJob.once('start', this._createSafeListener(this._onBrowserJobStart));
        browserJob.once('done', this._createSafeListener(this._onBrowserJobDone));
        browserJob.on('test-run-create', this._createSafeListener(this._onTestRunCreate));
        browserJob.on('test-run-ready', this._createSafeListener(this._onTestRunReady));
        browserJob.on('test-run-before-done', this._createSafeListener(this._onTestRunBeforeDone));
    }

    _getTargetVideoPath (testRunInfo) {
        const { test, index, testRun } = testRunInfo;

        const connection = testRun.browserConnection;

        const pathPattern = new PathPattern(this.customPathPattern, VIDEO_EXTENSION, {
            testIndex:         this.singleFile ? null : index,
            quarantineAttempt: null,
            now:               this.timeStamp,
            fixture:           this.singleFile ? '' : test.fixture.name,
            test:              this.singleFile ? '' : test.name,
            parsedUserAgent:   connection.browserInfo.parsedUserAgent,
        });

        return join(this.basePath, pathPattern.getPath());
    }

    _generateTempNames (id) {
        const tempFileNames = {
            tempVideoPath:       `${TEMP_VIDEO_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`,
            tempMergeConfigPath: `${TEMP_MERGE_CONFIG_FILE_PREFIX}-${id}.${TEMP_MERGE_CONFIG_FILE_EXTENSION}`,
            tmpMergeName:        `${TEMP_MERGE_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`
        };

        for (const [tempFile, tempName] of Object.entries(tempFileNames))
            tempFileNames[tempFile] = join(this.tempDirectory.path, tempName);

        return tempFileNames;
    }

    _concatVideo (targetVideoPath, { tempVideoPath, tempMergeConfigPath, tmpMergeName }) {
        if (this.firstFile) {
            this.firstFile = false;
            return;
        }

        fs.writeFileSync(tempMergeConfigPath, `
            file '${targetVideoPath}'
            file '${tempVideoPath}'
        `);

        spawnSync(this.ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', tempMergeConfigPath, '-c', 'copy', tmpMergeName], { stdio: 'ignore' });
        fs.copyFileSync(tmpMergeName, tempVideoPath);
    }

    async _onBrowserJobStart () {
        await this.tempDirectory.init();
    }

    async _onBrowserJobDone () {
        await this.tempDirectory.dispose();
    }

    async _onTestRunCreate ({ testRun, quarantine, test, index }) {
        const testRunInfo = { testRun, quarantine, test, index };

        const connection = testRun.browserConnection;

        const connectionCapabilities = await testRun.browserConnection.provider.hasCustomActionForBrowser(connection.id);

        if (!connectionCapabilities || !connectionCapabilities.hasGetVideoFrameData) {
            this.browserJob.warningLog.addWarning(WARNING_MESSAGES.videoNotSupportedByBrowserProvider, connection.browserInfo.alias);

            return;
        }

        this.testRunInfo[index] = testRunInfo;

        testRunInfo.tempFiles = this._generateTempNames(connection.id);


        testRunInfo.videoRecorder = new VideoRecorderProcess(testRunInfo.tempFiles.tempVideoPath, this.ffmpegPath, connection, this.encodingOptions);

        await testRunInfo.videoRecorder.init();
    }

    async _onTestRunReady (testRunController) {
        const testRunInfo = this.testRunInfo[testRunController.index];

        if (!testRunInfo)
            return;

        await testRunInfo.videoRecorder.startCapturing();
    }

    async _onTestRunBeforeDone (testRunController) {
        const testRunInfo = this.testRunInfo[testRunController.index];

        if (!testRunInfo)
            return;

        delete this.testRunInfo[testRunController.index];

        await testRunInfo.videoRecorder.finishCapturing();

        const videoPath = this._getTargetVideoPath(testRunInfo);

        if (this.failedOnly && !testRunController.testRun.errs.length)
            return;

        await makeDir(dirname(videoPath));

        if (this.singleFile)
            this._concatVideo(videoPath, testRunInfo.tempFiles);

        fs.copyFileSync(testRunInfo.tempFiles.tempVideoPath, videoPath);
    }
}
