const assertionHelper             = require('../../../assertion-helper.js');
const { expect }                  = require('chai');
const config                      = require('../../../config.js');
const { skipInExperimentalDebug } = require('../../../utils/skip-in.js');

if (config.useLocalBrowsers && config.useHeadlessBrowsers) {
    describe('[Regression](GH-5961)', () => {
        afterEach(assertionHelper.removeScreenshotDir);

        skipInExperimentalDebug('Screenshot', () => {
            return runTests('./testcafe-fixtures/index.js', 'Take a resized full page screenshot', { setScreenshotPath: true })
                .then(function () {
                    return assertionHelper.checkScreenshotFileFullPage(false, 'custom');
                })
                .then(function (result) {
                    expect(result).eql(true);
                });
        });
    });
}
