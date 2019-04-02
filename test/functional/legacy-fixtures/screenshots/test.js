const { expect }      = require('chai');
const assertionHelper = require('../../assertion-helper');

const SCREENSHOT_PATH_MESSAGE_RE = /___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1/;
const ERROR_SCREENSHOT_PATH_RE   = /Screenshot: .*?___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1[\\/]\S+[\\/]errors[\\/]\d.png/;

describe('Screenshots', () => {
    afterEach(assertionHelper.removeScreenshotDir);

    it('Should take a screenshot', () => {
        return runTests('./testcafe-fixtures/screenshots.test.js', 'Take a screenshot', { setScreenshotPath: true })
            .then(() => {
                expect(SCREENSHOT_PATH_MESSAGE_RE.test(testReport.screenshotPath)).eql(true);
                expect(assertionHelper.checkScreenshotsCreated({ forError: false, screenshotsCount: 2 })).eql(true);
            });
    });

    it('Should take a screenshot if an error in test code is raised', () => {
        return runTests('./testcafe-fixtures/screenshots.test.js', 'Screenshot on test code error',
            { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
            .catch(errs => {
                assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                expect(assertionHelper.checkScreenshotsCreated({ forError: true })).eql(true);
            });
    });
});
