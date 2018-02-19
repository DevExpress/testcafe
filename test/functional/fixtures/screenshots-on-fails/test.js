var expect          = require('chai').expect;
var config          = require('../../config.js');
var assertionHelper = require('../../assertion-helper.js');

var SCREENSHOT_PATH_MESSAGE_TEXT       = 'Screenshot: ___test-screenshots___';
var REPORT_SCREENSHOT_PATH_TEXT_RE     = /___test-screenshots___\\\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}\\test-1/;
var ERROR_SCREENSHOT_PATH_RE           = /Screenshot: ___test-screenshots___\\\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}\\test-1\\\S+\\errors\\\d.png/;
var QUARANTINE_MODE_SCREENSHOT_PATH_RE = /Screenshot: ___test-screenshots___\\\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}\\test-1\\run-3\\\S+\\errors\\\d.png/;

if (config.useLocalBrowsers) {
    describe('Screenshots on fails', function () {

        afterEach(assertionHelper.removeScreenshotDir);

        it('Should take a screenshot if the ensureElement method fails', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                {
                    shouldFail:         true,
                    screenshotsOnFails: true,
                    selectorTimeout:    0,
                    setScreenshotPath:  true
                })
                .catch(function (errs) {
                    // Report should contain screenshot path (GH-1269)
                    expect(REPORT_SCREENSHOT_PATH_TEXT_RE.test(global.testReport.screenshotPath)).eql(true);
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated(true)).eql(true);
                });
        });

        it('Should take a screenshot if an error on the page is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on page error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated(true)).eql(true);
                });
        });

        it('Should take a screenshot if an error in test code is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on test code error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated(true)).eql(true);
                });
        });

        it('Should take a screenshot if an assertion fails', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the assertion fail',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated(true)).eql(true);
                });
        });

        it('Should take a screenshot if beforeEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Screenshot on a beforeEach error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated(true)).eql(true);
                });
        });

        it('Should take screenshots if a test error occurs and if afterEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-test-and-after-each.js', 'Screenshots on afterEach and test errors',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 1);
                    expect(assertionHelper.checkScreenshotsCreated(true, 4)).eql(true);
                });
        });

        it('Should take a screenshot several times if test runs in quarantine mode', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Test for quarantine mode',
                {
                    shouldFail:         true,
                    screenshotsOnFails: true,
                    selectorTimeout:    0,
                    setScreenshotPath:  true,
                    quarantineMode:     true
                })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, QUARANTINE_MODE_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated(true, 2, null, 3)).eql(true);
                });
        });

        it('Should not take a screenshot if the ensureElement method fails with no screenshotsOnFails flag set', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                { shouldFail: true, selectorTimeout: 0, setScreenshotPath: true })
                .catch(function (errs) {
                    expect(assertionHelper.isScreenshotDirExists()).eql(false);
                    assertionHelper.errorInEachBrowserNotContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                });
        });

        it('Should not take a screenshot if the ensureElement method fails with no screenshotPath specified', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                { shouldFail: true, selectorTimeout: 0, screenshotsOnFails: true })
                .catch(function (errs) {
                    expect(assertionHelper.isScreenshotDirExists()).eql(false);
                    assertionHelper.errorInEachBrowserNotContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(testReport.warnings).eql([
                        'Was unable to take screenshots because the screenshot directory is not specified. To specify it, ' +
                        'use the "-s" or "--screenshots" command line option or the "screenshots" method of the ' +
                        'test runner in case you are using API.'
                    ]);
                });
        });

        it('Should crop screenshots to a page viewport area', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Crop screenshots',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    return assertionHelper.checkScreenshotsCropped(true);
                })
                .then(function (result) {
                    expect(result).eql(true);
                });
        });
    });
}
