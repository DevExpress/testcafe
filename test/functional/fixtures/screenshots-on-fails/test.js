const expect          = require('chai').expect;
const config          = require('../../config.js');
const assertionHelper = require('../../assertion-helper.js');

const SCREENSHOT_PATH_MESSAGE_TEXT       = 'Screenshot: ___test-screenshots___';
const REPORT_SCREENSHOT_PATH_TEXT_RE     = /___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1/;
const ERROR_SCREENSHOT_PATH_RE           = /Screenshot: .*?___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1[\\/]\S+[\\/]errors[\\/]\d.png/;
const QUARANTINE_MODE_SCREENSHOT_PATH_RE = /Screenshot: .*?___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1[\\/]run-3[\\/]\S+[\\/]errors[\\/]\d.png/;

describe('Screenshots on fails', function () {
    afterEach(assertionHelper.removeScreenshotDir);

    if (config.useLocalBrowsers && config.currentEnvironmentName !== config.testingEnvironmentNames.localBrowsersIE) {
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
                    expect(assertionHelper.checkScreenshotsCreated({ forError: true })).eql(true);
                });
        });

        it('Should take a screenshot if an error on the page is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on page error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated({ forError: true })).eql(true);
                });
        });

        it('Should take a screenshot if an error in test code is raised', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on test code error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated({ forError: true })).eql(true);
                });
        });

        it('Should take a screenshot if an assertion fails', function () {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the assertion fail',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated({ forError: true })).eql(true);
                });
        });

        it('Should take a screenshot if beforeEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Screenshot on a beforeEach error',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    expect(assertionHelper.checkScreenshotsCreated({ forError: true })).eql(true);
                });
        });

        it('Should take screenshots if a test error occurs and if afterEach raises an error', function () {
            return runTests('./testcafe-fixtures/fail-in-test-and-after-each.js', 'Screenshots on afterEach and test errors',
                { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                .catch(function (errs) {
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                    assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 1);
                    expect(assertionHelper.checkScreenshotsCreated({ forError: true, screenshotsCount: 4 })).eql(true);
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

                    const screenshotsCheckingOptions = { forError: true, screenshotsCount: 2, runDirCount: 3 };

                    expect(assertionHelper.checkScreenshotsCreated(screenshotsCheckingOptions)).eql(true);
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
    }
    else if (!config.useLocalBrowsers) {
        it('Should show a warning on an attempt to capture a screenshot for a remote browser', () => {
            return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
                {
                    only:               'chrome',
                    shouldFail:         true,
                    screenshotsOnFails: true,
                    selectorTimeout:    0,
                    setScreenshotPath:  true
                })
                .catch(() => {
                    expect(testReport.warnings).eql([
                        'The screenshot and window resize functionalities are not supported in a remote browser. ' +
                        'They can function only if the browser is running on the same machine and ' +
                        'in the same environment as the TestCafe server.'
                    ]);
                });
        });
    }
});

