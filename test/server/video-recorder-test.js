

const { expect }           = require('chai');
const { noop }             = require('lodash');
const TestRun              = require('../../lib/test-run/index');
const VideoRecorder        = require('../../lib/video-recorder/recorder');
const Videos               = require('../../lib/video-recorder/videos');
const TestRunVideoRecorder = require('../../lib/video-recorder/test-run-video-recorder');
const AsyncEmitter         = require('../../lib/utils/async-event-emitter');
const WarningLog           = require('../../lib/notifications/warning-log');
const COMMAND_TYPE         = require('../../lib/test-run/commands/type');
const renderTemplate       = require('../../lib/utils/render-template');

const VIDEOS_BASE_PATH = '__videos__';

class VideoRecorderProcessMock {
    constructor () {
    }

    init () {
    }

    startCapturing () {
    }

    finishCapturing () {
    }
}

class TestRunVideoRecorderMock extends TestRunVideoRecorder {
    constructor (testRunInfo, recordingOptions, warningLog, testLog) {
        super(testRunInfo, recordingOptions, warningLog);

        this.log = testLog;
    }

    _generateTempNames () {
        const result = super._generateTempNames();

        this.log.push('generate-names');

        return result;
    }

    _createVideoRecorderProcess () {
        return new VideoRecorderProcessMock();
    }
}

class VideoRecorderMock extends VideoRecorder {
    constructor (basePath, ffmpegPath, connection, customOptions) {
        super(basePath, ffmpegPath, connection, customOptions);

        this.log = [];

        this.warningLog = {
            addWarning: (message, ...args) => {
                const msg = renderTemplate(message, ...args);

                this.log.push(msg);
            }
        };
    }

    _createTestRunVideoRecorder (testRunInfo, recordingOptions) {
        return new TestRunVideoRecorderMock(testRunInfo, recordingOptions, this.warningLog, this.log);
    }

    _onBrowserJobStart () {
        this.log.push('job-start');

        return super._onBrowserJobStart()
            .then(() => {
                this.log.push('temp-dir-initialized');
            });
    }

    _onTestRunCreate (options) {
        this.log.push('test-created');

        return super._onTestRunCreate(options);
    }

    _getTargetVideoPath (testRunRecorder) {
        return `path-${testRunRecorder.testRun.id}`;
    }

    _saveFiles () {
    }
}

class VideosMock extends Videos {
    constructor (browserJobs, options, warningLog, timeStamp) {
        super(browserJobs, options, warningLog, timeStamp);
    }

    _createVideoRecorder (browserJob, videoPath, options, videoEncodingOptions, warningLog) {
        return new VideoRecorderMock(browserJob, videoPath, options, videoEncodingOptions, warningLog);
    }
}

function createTestRunMock (warningLog) {
    const testRun = Object.create(TestRun.prototype);

    Object.assign(testRun, {
        test:                     { name: 'Test', id: 'test-id' },
        debugLog:                 { command: noop },
        _enqueueCommand:          noop,
        browserManipulationQueue: [],
        warningLog:               warningLog,

        opts: { videoPath: 'path' },

        browserConnection: {
            id:       'connectionId',
            provider: {
                hasCustomActionForBrowser: () => {
                    return {
                        hasGetVideoFrameData: true
                    };
                }
            },
        }
    });

    return {
        testRun,
        test:  { skip: false },
        index: 0
    };
}

describe('Video Recorder', () => {
    it('Should not start video recording for legacy tests', () => {
        const browserJobMock = new AsyncEmitter();
        const videoRecorder  = new VideoRecorder(browserJobMock, VIDEOS_BASE_PATH, {}, {});

        const testRunCreateEventDataMock = {
            testRun:    {},
            legacy:     true,
            index:      1,
            test:       {},
            quarantine: null
        };

        return browserJobMock
            .emit('start')
            .then(() => browserJobMock.emit('test-run-created', testRunCreateEventDataMock))
            .then(() => {
                expect(videoRecorder.testRunVideoRecorders).to.be.empty;
            });
    });

    it('Should correctly format the warning message about no suitable path pattern placeholders', () => {
        const browserJobMock = new AsyncEmitter();
        const warningLog     = new WarningLog();
        const videoRecorder  = new VideoRecorder(browserJobMock, VIDEOS_BASE_PATH, {}, {}, warningLog);

        videoRecorder._addProblematicPlaceholdersWarning(['${TEST_INDEX}']);
        expect(warningLog.messages).eql([
            'The "${TEST_INDEX}" path pattern placeholder cannot be applied to the recorded video.' +
            '\n\n' +
            'The placeholder was replaced with an empty string.'
        ]);
        warningLog.messages = [];

        videoRecorder._addProblematicPlaceholdersWarning(['${TEST_INDEX}', '${FIXTURE}']);
        expect(warningLog.messages).eql([
            'The "${TEST_INDEX}" and "${FIXTURE}" path pattern placeholders cannot be applied to the recorded video.' +
            '\n\n' +
            'The placeholders were replaced with an empty string.'
        ]);
    });

    it('Should wait for Temp directory is initialized', () => {
        const browserJobMock = new AsyncEmitter();
        const warningLog     = new WarningLog();
        const videoRecorder  = new VideoRecorderMock(browserJobMock, VIDEOS_BASE_PATH, {}, {}, warningLog);

        browserJobMock.emit('start');

        const testRunCreatePromise = browserJobMock.emit('test-run-create', createTestRunMock());

        browserJobMock.emit('done');

        return testRunCreatePromise.then(() => {
            expect(videoRecorder.log).eql([
                'job-start',
                'test-created',
                'temp-dir-initialized',
                'generate-names'
            ]);
        });
    });

    it('Should emit a warning on resize action', () => {
        const browserJobMock = new AsyncEmitter();
        const videoRecorder  = new VideoRecorderMock(browserJobMock, VIDEOS_BASE_PATH, {}, {});

        const testRunMock = createTestRunMock(videoRecorder.warningLog);

        return browserJobMock.emit('start')
            .then(() => browserJobMock.emit('test-run-create', testRunMock))
            .then(() => browserJobMock.emit('test-run-before-done', testRunMock))
            .then(() => testRunMock.testRun.executeCommand({ type: COMMAND_TYPE.resizeWindow }))
            .then(() => {
                expect(videoRecorder.log.includes('The browser window was resized during the "Test" test while TestCafe recorded a video. TestCafe cannot adjust the video resolution during recording. As a result, the video content may appear broken. Do not resize the browser window when TestCafe records a video.')).to.be.true;
            });
    });

    it('Should build correct video info object', () => {
        const browserJobMock = new AsyncEmitter();

        const videos1 = new VideosMock([browserJobMock], { videoPath: VIDEOS_BASE_PATH, videoOptions: { singleFile: true } });
        const videos2 = new VideosMock([browserJobMock], { videoPath: VIDEOS_BASE_PATH, videoOptions: { singleFile: false } });

        const testRunMock1 = createTestRunMock();
        const testRunMock2 = createTestRunMock();
        const testRunMock3 = createTestRunMock();
        const testRunMock4 = createTestRunMock();

        const test1 = { name: 'Test1', id: 'test-1' };
        const test2 = { name: 'Test2', id: 'test-2' };

        Object.assign(testRunMock1.testRun, { session: { id: 'test-run-1' }, test: test1 });
        Object.assign(testRunMock2.testRun, { session: { id: 'test-run-2' }, test: test1 });
        Object.assign(testRunMock3.testRun, { session: { id: 'test-run-3' }, test: test2 });
        Object.assign(testRunMock4.testRun, { session: { id: 'test-run-4' }, test: test2 });

        testRunMock1.index = 0;
        testRunMock2.index = 1;
        testRunMock3.index = 2;
        testRunMock4.index = 3;

        const expectedLog1 = {
            testVideoInfos: {
                'test-1': {
                    recordings: [{
                        testRunId:  'test-run-1',
                        videoPath:  'path-test-run-1',
                        singleFile: true
                    }, {
                        testRunId:  'test-run-2',
                        videoPath:  'path-test-run-2',
                        singleFile: true
                    }]
                },
                'test-2': {
                    recordings: [{
                        testRunId:  'test-run-3',
                        videoPath:  'path-test-run-3',
                        singleFile: true
                    }, {
                        testRunId:  'test-run-4',
                        videoPath:  'path-test-run-4',
                        singleFile: true
                    }]
                }
            }
        };

        const expectedLog2 = {
            testVideoInfos: {
                'test-1': {
                    recordings: [{
                        testRunId:  'test-run-1',
                        videoPath:  'path-test-run-1',
                        singleFile: false
                    }, {
                        testRunId:  'test-run-2',
                        videoPath:  'path-test-run-2',
                        singleFile: false
                    }]
                },
                'test-2': {
                    recordings: [{
                        testRunId:  'test-run-3',
                        videoPath:  'path-test-run-3',
                        singleFile: false
                    }, {
                        testRunId:  'test-run-4',
                        videoPath:  'path-test-run-4',
                        singleFile: false
                    }]
                }
            }
        };


        return browserJobMock.emit('start')
            .then(() => browserJobMock.emit('test-run-create', testRunMock1))
            .then(() => browserJobMock.emit('test-run-before-done', testRunMock1))
            .then(() => browserJobMock.emit('test-run-create', testRunMock2))
            .then(() => browserJobMock.emit('test-run-before-done', testRunMock2))
            .then(() => browserJobMock.emit('test-run-create', testRunMock3))
            .then(() => browserJobMock.emit('test-run-before-done', testRunMock3))
            .then(() => browserJobMock.emit('test-run-create', testRunMock4))
            .then(() => browserJobMock.emit('test-run-before-done', testRunMock4))
            .then(() => {
                expect(videos1).eql(expectedLog1);
                expect(videos2).eql(expectedLog2);
            });
    });
});
