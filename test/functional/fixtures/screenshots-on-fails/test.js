var expect                        = require('chai').expect;
var config                        = require('../../config.js');
var errorInEachBrowserContains    = require('../../assertion-helper.js').errorInEachBrowserContains;
var errorInEachBrowserNotContains = require('../../assertion-helper.js').errorInEachBrowserNotContains;
var checkScreenshotsCreated       = require('../../assertion-helper.js').checkScreenshotsCreated;


if (!config.isTravisTask) {
    describe('Screenshots on fails', function () {
        var SCREENSHOT_PATH_MESSAGE_TEXT = 'Screenshot: ___test-screenshots___';
        var testErrors                   = null;

        it('Should take a screenshot if the ensureElement method fails', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                {
                    shouldFail:                 true,
                    screenshotsOnFails:         true,
                    elementAvailabilityTimeout: 0,
                    setScreenshotPath:          true,
                    only:                       'local'
                })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated();
                })
                .then(function (success) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });

        it('Should take a screenshot if an error on the page is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on page error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated();
                })
                .then(function (success) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });

        it('Should take a screenshot if an error in test code is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on test code error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated();
                })
                .then(function (success) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });

        it('Should take a screenshot if an assertion fails', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the assertion fail',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated();
                })
                .then(function (success) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });

        it('Should take a screenshot if beforeEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Screenshot on a beforeEach error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated();
                })
                .then(function (success) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });

        it('Should take screenshots if a test error occurs and if afterEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-test-and-after-each.js', 'Screenshots on afterEach and test errors',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated(false, 4);
                })
                .then(function (success) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 1);
                    expect(success).eql(true);
                });
        });

        it('Should not take a screenshot if the ensureElement method fails with no screenshotsOnFails flag set', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                { shouldFail: true, elementAvailabilityTimeout: 0, setScreenshotPath: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated(true);
                })
                .then(function (success) {
                    errorInEachBrowserNotContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });

        it('Should not take a screenshot if the ensureElement method fails with no screenshotPath specified', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                { shouldFail: true, elementAvailabilityTimeout: 0, screenshotsOnFails: true, only: 'local' })
                .catch(function (errs) {
                    testErrors = errs;
                    return checkScreenshotsCreated(true);
                })
                .then(function (success) {
                    errorInEachBrowserNotContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                });
        });
    });
}
