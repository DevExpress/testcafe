var expect          = require('chai').expect;
var globby          = require('globby').sync;
var path            = require('path');
var config          = require('../../../../config');
var assertionHelper = require('../../../../assertion-helper');


var SCREENSHOT_PATH_MESSAGE_RE = /^___test-screenshots___\\\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}\\test-1$/;
var ERROR_SCREENSHOT_PATH_RE   = /Screenshot: ___test-screenshots___\\\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}\\test-1\\\S+\\errors\\\d.png/;

describe('[Legacy] Smoke tests', function () {
    it('Should run basic tests', function () {
        return runTests(globby(path.join(__dirname, './testcafe-fixtures/basic/*test.js')), null, { skip: 'iphone,ipad' });
    });

    it('Should fail on errors', function () {
        return runTests('./testcafe-fixtures/errors.test.js', null, { shouldFail: true, skip: 'iphone,ipad' })
            .catch(function (errs) {
                expect(errs[0]).contains('A target element of the click action has not been found in the DOM tree.');
            });
    });

    if (config.useLocalBrowsers) {
        describe('Screenshots', function () {
            afterEach(assertionHelper.removeScreenshotDir);

            it('Should take a screenshot', function () {
                return runTests('./testcafe-fixtures/screenshots.test.js', 'Take a screenshot', { setScreenshotPath: true })
                    .then(function () {
                        expect(SCREENSHOT_PATH_MESSAGE_RE.test(testReport.screenshotPath)).eql(true);
                        expect(assertionHelper.checkScreenshotsCreated(false, 2)).eql(true);
                    });
            });

            it('Should take a screenshot if an error in test code is raised', function () {
                return runTests('./testcafe-fixtures/screenshots.test.js', 'Screenshot on test code error',
                    { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true })
                    .catch(function (errs) {
                        assertionHelper.errorInEachBrowserContainsRegExp(errs, ERROR_SCREENSHOT_PATH_RE, 0);
                        expect(assertionHelper.checkScreenshotsCreated(true)).eql(true);
                    });
            });
        });
    }
});
