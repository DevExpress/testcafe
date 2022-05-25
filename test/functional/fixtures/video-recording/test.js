const { expect }         = require('chai');
const path               = require('path');
const { uniq }           = require('lodash');
const config             = require('../../config');
const assertionHelper    = require('../../assertion-helper.js');
const { createReporter } = require('../../utils/reporter');
const ffprobe            = require('@ffprobe-installer/ffprobe');
const childProcess       = require('child_process');

function customReporter (errs, videos) {
    return createReporter({
        async reportTestDone (name, testRunInfo) {
            testRunInfo.errs.forEach(err => {
                errs[err.errMsg] = true;
            });

            testRunInfo.videos.forEach(video => {
                videos.push(video);
            });
        },
    });
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

function getVideoDuration (videoPath) {
    const command = `${ffprobe.path} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${videoPath}`;
    const result  = childProcess.execSync(command);

    return Math.ceil(parseFloat(result.toString()));
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
                reporter:     customReporter(errs, videos),
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
                    singleFile: true,
                },
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
                    failedOnly: true,
                },
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
                    singleFile: true,
                },
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

        // TODO: fix test for Debug task
        (config.experimentalDebug ? it.skip : it)('Should record video with quarantine mode enabled (multiple attempts)', () => {
            const errs   = {};
            const videos = [];

            return runTests('./testcafe-fixtures/quarantine-test.js', 'quarantine with attempts', {
                only:           'chrome',
                quarantineMode: true,
                setVideoPath:   true,
                reporter:       customReporter(errs, videos),
            })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).eql(1);
                    expect(videos[0].timecodes.length).eql(4);
                    expect(videos[0].timecodes[0]).eql(0);
                    expect(videos[0].timecodes.filter(tc => tc > 0).length).eql(3);

                    checkVideoPaths(videos, videoFiles);
                });
        });

        it('Should record video with quarantine mode enabled (no attempts)', () => {
            const errs   = {};
            const videos = [];

            return runTests('./testcafe-fixtures/quarantine-test.js', 'quarantine without attempts', {
                only:           'chrome',
                quarantineMode: true,
                setVideoPath:   true,
                reporter:       customReporter(errs, videos),
            })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(1);

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
                    pathPattern: '${TEST_INDEX}_.mp4',
                },
            })
                .catch(() => {
                    expect(testReport.warnings).eql(['The "${TEST_INDEX}" path pattern placeholder cannot be applied to the recorded video.' +
                                                     '\n\n' +
                                                     'The placeholder was replaced with an empty string.']);
                });
        });

        it('Should record a correct video for test with only "wait action"', () => {
            return runTests('./testcafe-fixtures/only-wait.js', '', {
                only:         'chrome',
                setVideoPath: true,
            })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(1);

                    const duration = getVideoDuration(videoFiles[0]);

                    expect(duration).gte(10);
                });
        });
    });
}
