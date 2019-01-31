const expect        = require('chai').expect;
const VideoRecorder = require('../../lib/video-recorder');
const AsyncEmitter  = require('../../lib/utils/async-event-emitter');


const VIDEOS_BASE_PATH = '__videos__';

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
                expect(videoRecorder.testRunInfo).to.be.empty;
            });
    });
});
