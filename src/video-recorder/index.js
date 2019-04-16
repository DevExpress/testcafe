import debug from 'debug';
import { join, dirname } from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import makeDir from 'make-dir';
import TempDirectory from '../utils/temp-directory';
import PathPattern from '../utils/path-pattern';
import WARNING_MESSAGES from '../notifications/warning-message';
import { getPluralSuffix, getConcatenatedValuesString, getToBeInPastTense } from '../utils/string';

import TestRunVideoRecorder from './test-run-video-recorder';

const DEBUG_LOGGER = debug('testcafe:video-recorder');

const VIDEO_EXTENSION = 'mp4';
const TEMP_DIR_PREFIX = 'video';

export default class VideoRecorder {
    constructor (browserJob, basePath, opts, encodingOpts, warningLog) {
        this.browserJob        = browserJob;
        this.basePath          = basePath;
        this.failedOnly        = opts.failedOnly;
        this.singleFile        = opts.singleFile;
        this.ffmpegPath        = opts.ffmpegPath;
        this.customPathPattern = opts.pathPattern;
        this.timeStamp         = opts.timeStamp;
        this.encodingOptions   = encodingOpts;

        this.warningLog = warningLog;

        this.tempDirectory = new TempDirectory(TEMP_DIR_PREFIX);

        this.firstFile = true;

        this.testRunVideoRecorders = {};

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
        browserJob.once('start', this._createSafeListener(() => {
            this.tempDirectoryInitializedPromise = this._onBrowserJobStart();

            return this.tempDirectoryInitializedPromise;
        }));

        browserJob.once('done', this._createSafeListener(this._onBrowserJobDone));
        browserJob.on('test-run-create', this._createSafeListener(this._onTestRunCreate));
        browserJob.on('test-run-ready', this._createSafeListener(this._onTestRunReady));
        browserJob.on('test-run-before-done', this._createSafeListener(this._onTestRunBeforeDone));
    }

    _addProblematicPlaceholdersWarning (placeholders) {
        const problematicPlaceholderListStr = getConcatenatedValuesString(placeholders);
        const suffix                        = getPluralSuffix(placeholders);
        const verb                          = getToBeInPastTense(placeholders);

        this.warningLog.addWarning(WARNING_MESSAGES.problematicPathPatternPlaceholderForVideoRecording, problematicPlaceholderListStr, suffix, suffix, verb);
    }

    _getTargetVideoPath (testRunRecorder) {
        const data = Object.assign(testRunRecorder.testRunInfo, { now: this.timeStamp });

        if (this.singleFile) {
            data.testIndex = null;
            data.fixture = null;
            data.test = null;
        }

        const pathPattern = new PathPattern(this.customPathPattern, VIDEO_EXTENSION, data);

        pathPattern.on('problematic-placeholders-found', ({ placeholders }) => this._addProblematicPlaceholdersWarning(placeholders));

        return join(this.basePath, pathPattern.getPath());
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

    async _onTestRunCreate (testRunInfo) {
        if (testRunInfo.legacy)
            return;

        await this.tempDirectoryInitializedPromise;

        const recordingOptions = {
            path:            this.tempDirectory.path,
            ffmpegPath:      this.ffmpegPath,
            encodingOptions: this.encodingOptions
        };

        const testRunVideoRecorder = this._createTestRunVideoRecorder(testRunInfo, recordingOptions);
        const isVideoSupported     = await testRunVideoRecorder.isVideoSupported();

        if (isVideoSupported) {
            await testRunVideoRecorder.init();

            this.testRunVideoRecorders[testRunVideoRecorder.index] = testRunVideoRecorder;
        }
        else
            this.warningLog.addWarning(WARNING_MESSAGES.videoNotSupportedByBrowser, testRunVideoRecorder.testRunInfo.alias);
    }

    _createTestRunVideoRecorder (testRunInfo, recordingOptions) {
        return new TestRunVideoRecorder(testRunInfo, recordingOptions, this.warningLog);
    }

    async _onTestRunReady ({ index }) {
        const testRunRecorder = this.testRunVideoRecorders[index];

        if (!testRunRecorder)
            return;

        await testRunRecorder.startCapturing();
    }

    async _onTestRunBeforeDone ({ index }) {
        const testRunRecorder = this.testRunVideoRecorders[index];

        if (!testRunRecorder)
            return;

        delete this.testRunVideoRecorders[index];

        await testRunRecorder.finishCapturing();

        if (this.failedOnly && !testRunRecorder.hasErrors)
            return;

        await this._saveFiles(testRunRecorder);
    }

    async _saveFiles (testRunRecorder) {
        const videoPath = this._getTargetVideoPath(testRunRecorder);

        await makeDir(dirname(videoPath));

        if (this.singleFile)
            this._concatVideo(videoPath, testRunRecorder.tempFiles);

        fs.copyFileSync(testRunRecorder.tempFiles.tempVideoPath, videoPath);
    }
}
