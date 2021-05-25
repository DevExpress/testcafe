const __importDefault = this && this.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { 'default': mod };
};
const createTestCafe = require('../../../../../');
const sinon = require('sinon');
const assert = require('assert');
const VideoRecorder = require('../../../../../lib/video-recorder/process');

describe('FFMPEG shouldn\'t run, when fixture skipped', () => {
    it('Start fixture with skip and look for FFMPEG init function', async function () {
        this.timeout(20000);

        let ffmpegWasCalled = false;

        sinon.stub(VideoRecorder.prototype, 'init').callsFake(() => {
            ffmpegWasCalled = true;
        });

        let runner;
        let testcafe;

        await createTestCafe('localhost', '', '')
            .then(testcafeInstance => {
                runner = testcafeInstance.createRunner();
                testcafe = testcafeInstance;
            })
            .then(() => {
                return runner
                    .src('test/functional/fixtures/video-recording/skip/fixture.test.js')
                    .browsers('chrome')
                    .video('reports')
                    .run();
            })
            .then(async () => {
                testcafe.close();
                assert.deepStrictEqual(ffmpegWasCalled, false);
            });
    });
});
