const { expect }       = require('chai');
const path             = require('path');
const config           = require('../../../../config');
const assertionHelper  = require('../../../../assertion-helper');

const SCREENSHOT_PATH_MESSAGE_RE = /___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1/;
const ERROR_SCREENSHOT_PATH_RE   = /Screenshot: .*?___test-screenshots___[\\/]\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}[\\/]test-1[\\/]\S+[\\/]errors[\\/]\d.png/;

if (config.useLocalBrowsers) {
    describe('[Legacy] Smoke tests', () => {
        it('Should run basic tests', () => {
            return runTests(path.join(__dirname, './testcafe-fixtures/basic/*test.js'), null, { skip: 'iphone,ipad' });
        });

        it('Should fail on errors', () => {
            return runTests('./testcafe-fixtures/errors.test.js', null, { shouldFail: true, skip: 'iphone,ipad' })
                .catch(errs => {
                    expect(errs[0]).contains('A target element of the click action has not been found in the DOM tree.');
                });
        });

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
    });
}
