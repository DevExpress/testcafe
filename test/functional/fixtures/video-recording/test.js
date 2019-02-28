const expect = require('chai').expect;
const config = require('../../config');
const assertionHelper = require('../../assertion-helper.js');


if (config.useLocalBrowsers) {
    describe('Video Recording', () => {
        afterEach(assertionHelper.removeVideosDir);

        it('Should record video without options', () => {
            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         'chrome,firefox',
                setVideoPath: true,
                shouldFail:   true
            })
                .catch(errors => {
                    expect(errors.length).to.equal(2);
                    expect(errors[0]).to.match(/^Error: Error 1/);
                    expect(errors[1]).to.match(/^Error: Error 2/);
                })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(3 * config.browsers.length);
                });
        });

        it('Should record video in a single file', ()=> {
            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         'chrome,firefox',
                shouldFail:   true,
                setVideoPath: true,

                videoOptions: {
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
                    expect(videoFiles.length).to.equal(1 * config.browsers.length);
                });
        });

        it('Should record only failed tests', () => {
            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         'chrome,firefox',
                shouldFail:   true,
                setVideoPath: true,

                videoOptions: {
                    failedOnly: true
                }
            })
                .catch(assertionHelper.getVideoFilesList)
                .catch(errors => {
                    expect(errors.length).to.equal(2);
                    expect(errors[0]).to.match(/^Error: Error 1/);
                    expect(errors[1]).to.match(/^Error: Error 2/);
                })
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(2 * config.browsers.length);
                });
        });

        it('Should record only failed tests in a single file', () => {
            return runTests('./testcafe-fixtures/index-test.js', '', {
                only:         'chrome,firefox',
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
                    expect(videoFiles.length).to.equal(1 * config.browsers.length);
                });
        });

        it('Should record video with quarantine mode enabled', () => {
            return runTests('./testcafe-fixtures/quarantine-test.js', '', {
                only:           'chrome',
                quarantineMode: true,
                setVideoPath:   true
            })
                .then(assertionHelper.getVideoFilesList)
                .then(videoFiles => {
                    expect(videoFiles.length).to.equal(2);
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
