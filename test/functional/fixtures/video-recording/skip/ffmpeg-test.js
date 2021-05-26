const createTestCafe = require('../../../../../');
const sinon = require('sinon');
const assert = require('assert');
const config = require('../../../config');
const VideoRecorder = require('../../../../../lib/video-recorder/process');

if (config.useLocalBrowsers) {
    describe('FFMPEG shouldn\'t run, when fixture skipped', () => {
        it('Start fixture with skip and look for FFMPEG init function', async function () {
            this.timeout(30000);

            let ffmpegWasCalled = false;

            sinon.stub(VideoRecorder.prototype, 'init').callsFake(() => {
                ffmpegWasCalled = true;
            });

            let runner;
            let testcafe;

            await createTestCafe('localhost', '', '')
                .then(testcafeInstance => {
                    runner   = testcafeInstance.createRunner();
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
}
