var expect          = require('chai').expect;
var config          = require('../../../../config.js');
var assertionHelper = require('../../../../assertion-helper.js');


var SCREENSHOT_PATH_MESSAGE_RE     = /^___test-screenshots___\\\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}\\test-1$/;
var CUSTOM_SCREENSHOT_PATH_MESSAGE = '___test-screenshots___';


describe('[API] t.takeScreenshot()', function () {
    if (config.useLocalBrowsers) {
        afterEach(assertionHelper.removeScreenshotDir);

        it('Should take a screenshot', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot', { setScreenshotPath: true })
                .then(function () {
                    expect(SCREENSHOT_PATH_MESSAGE_RE.test(testReport.screenshotPath)).eql(true);
                    expect(assertionHelper.checkScreenshotsCreated(false, 4)).eql(true);
                });
        });

        it('Should take a screenshot with a custom path (OS separator)', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot with a custom path (OS separator)',
                { setScreenshotPath: true })
                .then(function () {
                    expect(testReport.screenshotPath).eql(CUSTOM_SCREENSHOT_PATH_MESSAGE);
                    expect(assertionHelper.checkScreenshotsCreated(false, 2, 'custom')).eql(true);
                });
        });

        it('Should take a screenshot with a custom path (DOS separator)', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot with a custom path (DOS separator)',
                { setScreenshotPath: true })
                .then(function () {
                    expect(testReport.screenshotPath).contains(CUSTOM_SCREENSHOT_PATH_MESSAGE);
                    expect(assertionHelper.checkScreenshotsCreated(false, 2, 'custom')).eql(true);
                });
        });

        it('Should create warning if screenshotPath is not specified', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot')
                .then(function () {
                    expect(assertionHelper.isScreenshotDirExists()).eql(false);
                    expect(testReport.warnings).eql([
                        'Was unable to take screenshots because the screenshot directory is not specified. To specify it, ' +
                        'use the "-s" or "--screenshots" command line option or the "screenshots" method of the ' +
                        'test runner in case you are using API.'
                    ]);
                });
        });

        it('Should create warning if screenshotPath is not specified even if a custom path is specified', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot with a custom path (OS separator)')
                .then(function () {
                    expect(assertionHelper.isScreenshotDirExists()).eql(false);
                    expect(testReport.warnings).eql([
                        'Was unable to take screenshots because the screenshot directory is not specified. To specify it, ' +
                        'use the "-s" or "--screenshots" command line option or the "screenshots" method of the ' +
                        'test runner in case you are using API.'
                    ]);
                });
        });

        it('Should validate path argument', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Incorrect action path argument', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The "path" argument is expected to be a non-empty string, but it was number.');
                    expect(errs[0]).to.contains(
                        '33 |test(\'Incorrect action path argument\', async t => {' +
                        ' > 34 |    await t.takeScreenshot(1); ' +
                        '35 |});'
                    );
                });
        });

        it('Should take a screenshot in quarantine mode', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot in quarantine mode', {
                setScreenshotPath: true,
                quarantineMode:    true
            })
                .catch(function () {
                    expect(SCREENSHOT_PATH_MESSAGE_RE.test(testReport.screenshotPath)).eql(true);
                    expect(assertionHelper.checkScreenshotsCreated(false, 2, null, 3)).eql(true);
                });
        });

        it('Should crop screenshots to a page viewport area', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Should crop screenshots',
                { setScreenshotPath: true })
                .then(function () {
                    expect(assertionHelper.checkScreenshotsCropped(false, 'custom')).eql(true);
                });
        });
    }
});

