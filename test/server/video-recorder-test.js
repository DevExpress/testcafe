const { expect }      = require('chai');
const TestRun         = require('../../lib/test-run/index');
const VideoRecorder   = require('../../lib/video-recorder');
const TestRunRecorder = require('../../lib/video-recorder/test-run-recorder');
const AsyncEmitter    = require('../../lib/utils/async-event-emitter');
const WarningLog      = require('../../lib/notifications/warning-log');
const COMMAND_TYPE    = require('../../lib/test-run/commands/type');
const renderTemplate  = require('../../lib/utils/render-template');

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

class TestRunRecorderMock extends TestRunRecorder {
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

    _createTestRunRecorder (testRunInfo, recordingOptions) {
        return new TestRunRecorderMock(testRunInfo, recordingOptions, this.warningLog, this.log);
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

    _saveFiles () {
    }
}

function createTestRunMock () {
    const testRun = TestRun.prototype;

    testRun.test = { name: 'Test' };

    testRun.commands = [{ type: COMMAND_TYPE.resizeWindow }];

    testRun.browserConnection = {
        id:       'connectionId',
        provider: {
            hasCustomActionForBrowser: () => {
                return {
                    hasGetVideoFrameData: true
                };
            }
        },

    };

    return {
        testRun,
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
                expect(videoRecorder.testRunRecorders).to.be.empty;
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
            'The "${TEST_INDEX}", "${FIXTURE}" path pattern placeholders cannot be applied to the recorded video.' +
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

        const testRunMock = createTestRunMock();

        return browserJobMock.emit('start')
            .then(() => browserJobMock.emit('test-run-create', testRunMock))
            .then(() => browserJobMock.emit('test-run-before-done', testRunMock))
            .then(() => {
                expect(videoRecorder.log.includes('Resize action is executed when video is recording in the "Test" test')).to.be.true;
            });
    });
});
