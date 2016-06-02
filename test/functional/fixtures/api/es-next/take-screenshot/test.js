var expect          = require('chai').expect;
var OS              = require('os-family');
var config          = require('../../../../config.js');
var assertionHelper = require('../../../../assertion-helper.js');


var SCREENSHOT_PATH_MESSAGE_TEXT = '___test-screenshots___';


describe('[API] t.takeScreenshot()', function () {
    if (config.useLocalBrowsers) {
        afterEach(assertionHelper.removeScreenshotDir);

        it('Should take a screenshot', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot', { setScreenshotPath: true })
                .then(function () {
                    expect(testReport.screenshotPath).contains(SCREENSHOT_PATH_MESSAGE_TEXT);
                    expect(assertionHelper.checkScreenshotsCreated()).eql(true);

                    expect(testReport.warnings).includes(
                        'The screenshot and window resize functionality are not supported on a remote browser. ' +
                        'They might be performed only if the browser is running on the same machine and environment as the testcafe server.'
                    );
                });
        });

        it('Should take a screenshot with a custom path', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot with a custom path',
                { setScreenshotPath: true })
                .then(function () {
                    expect(testReport.screenshotPath).contains(SCREENSHOT_PATH_MESSAGE_TEXT);
                    expect(assertionHelper.checkScreenshotsCreated(2, 'custom')).eql(true);
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
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot with a custom path')
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
                        '20 | ' +
                        '21 |    await t.takeScreenshot(\'custom/\' + parsedUA.family + \'.png\'); ' +
                        '22 |}); ' +
                        '23 | ' +
                        '24 |test(\'Incorrect action path argument\', async t => {' +
                        ' > 25 |    await t.takeScreenshot(1); ' +
                        '26 |});'
                    );
                });
        });
    }

    if (OS.linux) {
        it('Should create warning on attempt to take screenshot on Linux', function () {
            return runTests('./testcafe-fixtures/take-screenshot.js', 'Take a screenshot', { setScreenshotPath: true })
                .catch(function () {
                    expect(assertionHelper.isScreenshotDirExists()).eql(false);

                    expect(testReport.warnings).includes(
                        'The screenshot and window resize functionality are not yet supported on Linux. ' +
                        'Subscribe to the following issue to keep track: https://github.com/DevExpress/testcafe-browser-natives/issues/12'
                    );
                });
        });
    }
});

