var expect          = require('chai').expect;
var config          = require('../../config.js');
var assertionHelper = require('../../assertion-helper.js');

var SCREENSHOT_PATH_MESSAGE_TEXT   = 'Screenshot: ___test-screenshots___';
var ERROR_SCREENSHOT_PATH          = '\\errors\\';
var SCREENSHOT_DIR_NOT_SET_MESSAGE = '[cannot take screenshots because the screenshot directory is not specified]';


if (!config.isTravisTask) {
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
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 0);
                    expect(assertionHelper.checkScreenshotsCreated()).eql(true);
                });
        });

        it('Should take a screenshot if an error on the page is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on page error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 0);
                    expect(assertionHelper.checkScreenshotsCreated()).eql(true);
                });
        });

        it('Should take a screenshot if an error in test code is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on test code error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 0);
                    expect(assertionHelper.checkScreenshotsCreated()).eql(true);
                });
        });

        it('Should take a screenshot if an assertion fails', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the assertion fail',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 0);
                    expect(assertionHelper.checkScreenshotsCreated()).eql(true);
                });
        });

        it('Should take a screenshot if beforeEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Screenshot on a beforeEach error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 0);
                    expect(assertionHelper.checkScreenshotsCreated()).eql(true);
                });
        });

        it('Should take screenshots if a test error occurs and if afterEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-test-and-after-each.js', 'Screenshots on afterEach and test errors',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 0);
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_PATH_MESSAGE_TEXT, 1);
                    assertionHelper.errorInEachBrowserContains(errs, ERROR_SCREENSHOT_PATH, 1);
                    expect(assertionHelper.checkScreenshotsCreated(4)).eql(true);
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
                    assertionHelper.errorInEachBrowserContains(errs, SCREENSHOT_DIR_NOT_SET_MESSAGE, 0);
                });
        });
    });
}
