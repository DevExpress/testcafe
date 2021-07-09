const expect          = require('chai').expect;
const path            = require('path');
const { uniq }        = require('lodash');
const config          = require('../../config');
const assertionHelper = require('../../assertion-helper.js');

function customReporter (errs, videos) {
    return () => {
        return {
            async reportTaskStart () {
            },
            async reportFixtureStart () {
            },
            async reportTestDone (name, testRunInfo) {
                testRunInfo.errs.forEach(err => {
                    errs[err.errMsg] = true;
                });

                testRunInfo.videos.forEach(video => {
                    videos.push(video);
                });
            },
            async reportTaskDone () {
            }
        };
    };
}

function checkVideoPaths (videoLog, videoPaths) {
    const testRunIds = uniq(videoLog.map(video => video.testRunId));

    expect(videoLog.length).eql(testRunIds.length);

    const loggedPaths = uniq(videoLog.map(video => video.videoPath)).sort();
    const actualPaths = [...videoPaths].sort();

    expect(loggedPaths.length).eql(videoPaths.length);

    for (let i = 0; i < loggedPaths.length; i++)
        expect(path.relative(actualPaths[i], loggedPaths[i])).eql('');
}

const BROWSERS_SUPPORTING_VIDEO_RECORDING     = ['chrome', 'firefox'];
const BROWSERS_SUPPORTING_VIDEO_RECORDING_STR = BROWSERS_SUPPORTING_VIDEO_RECORDING.toString();
const COUNT_AFFECTED_BROWSERS                 = config.browsers.filter(browser => BROWSERS_SUPPORTING_VIDEO_RECORDING.includes(browser.alias)).length;

if (config.useLocalBrowsers) {
    describe('Video Recording', () => {
        afterEach(assertionHelper.removeVideosDir);

        it('Should record video without options', () => {
            const errs   = {};
            const videos = [];

            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         BROWSERS_SUPPORTING_VIDEO_RECORDING_STR,
                setVideoPath: true,
                reporter:     customReporter(errs, videos)
            })
                .then(() => {
                    const errors = Object.keys(errs);

                    expect(errors.length).to.equal(2);
                    expect(errors[0]).to.match(/^Error: Error 1/);
                    expect(errors[1]).to.match(/^Error: Error 2/);
                })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(3 * COUNT_AFFECTED_BROWSERS);

                    checkVideoPaths(videos, videoFiles);
                });
        });

        it('Should record video in a single file', () => {
            const errs   = {};
            const videos = [];

            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         BROWSERS_SUPPORTING_VIDEO_RECORDING_STR,
                shouldFail:   true,
                setVideoPath: true,
                reporter:     customReporter(errs, videos),

                videoOptions: {
                    singleFile: true
                }
            })
                .then(() => {
                    const errors = Object.keys(errs);

                    expect(errors.length).to.equal(2);
                    expect(errors[0]).to.match(/^Error: Error 1/);
                    expect(errors[1]).to.match(/^Error: Error 2/);
                })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(1 * COUNT_AFFECTED_BROWSERS);

                    checkVideoPaths(videos, videoFiles);
                });
        });

        it('Should record only failed tests', () => {
            const errs   = {};
            const videos = [];

            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         BROWSERS_SUPPORTING_VIDEO_RECORDING_STR,
                shouldFail:   true,
                setVideoPath: true,
                reporter:     customReporter(errs, videos),

                videoOptions: {
                    failedOnly: true
                }
            })
                .then(() => {
                    const errors = Object.keys(errs);

                    expect(errors.length).to.equal(2);
                    expect(errors[0]).to.match(/^Error: Error 1/);
                    expect(errors[1]).to.match(/^Error: Error 2/);
                })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(2 * COUNT_AFFECTED_BROWSERS);

                    checkVideoPaths(videos, videoFiles);
                });
        });

        it('Should record only failed tests in a single file', () => {
            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         BROWSERS_SUPPORTING_VIDEO_RECORDING_STR,
                shouldFail:   true,
                setVideoPath: true,

                videoOptions: {
                    failedOnly: true,
                    singleFile: true
                }
            })
                .catch(assertionHelper.getVideoFilesList)
                .catch(errors => {
                    expect(errors.length).to.equal(2);
                    expect(errors[0]).to.match(/^Error: Error 1/);
                    expect(errors[1]).to.match(/^Error: Error 2/);
                })
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(1 * COUNT_AFFECTED_BROWSERS);
                });
        });

        it('Should record video with quarantine mode enabled', () => {
            const errs   = {};
            const videos = [];

            return runTests('./testcafe-fixtures/quarantine-test.js', '', {
                only:           'chrome',
                quarantineMode: true,
                setVideoPath:   true,
                reporter:       customReporter(errs, videos),
            })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(2);

                    checkVideoPaths(videos, videoFiles);
                });
        });

        it('Should display the warning if there is the not suitable placeholder for the "pathPattern" option was specified', () => {
            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         'chrome',
                shouldFail:   true,
                setVideoPath: true,

                videoOptions: {
                    singleFile:  true,
                    pathPattern: '${TEST_INDEX}_.mp4'
                }
            })
                .catch(() => {
                    expect(testReport.warnings).eql(['The "${TEST_INDEX}" path pattern placeholder cannot be applied to the recorded video.' +
                                                     '\n\n' +
                                                     'The placeholder was replaced with an empty string.']);
                });
        });
    });
}
