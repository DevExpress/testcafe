const createTestCafe = require('../../../../../lib');
const config          = require('../../../config');
const path            = require('path');
const { expect }      = require('chai');
const assertionHelper = require('../../../assertion-helper.js');

const SCREENSHOTS_PATH = path.resolve(assertionHelper.SCREENSHOTS_PATH);

if (config.useLocalBrowsers) {
    // NOTE: we need to skip this test until the `--window-size` problem is fixed in Chrome headless=new
    // details: https://github.com/DevExpress/testcafe-private/issues/225
    describe.skip('[Regression](GH-3456) Should process --window-size arg in Headless mode ', function () {
        it(':headless', () => {
            const browsers = [
                'chrome:headless --window-size=501,602',
                'chrome --headless=new --window-size=501,602',
            ];

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => assertionHelper.removeScreenshotDir())
                .then(() => {
                    const runner      = testCafe.createRunner();
                    const fixturePath = path.join(__dirname, '/testcafe-fixtures/index.js');

                    return runner
                        .src(fixturePath)
                        .browsers(browsers)
                        .screenshots(SCREENSHOTS_PATH)
                        .run({ disableNativeAutomation: !config.nativeAutomation });
                })
                .then(failedCount => {
                    expect(failedCount).eql(0);

                    return assertionHelper.checkScreenshotsDimensions({ width: 501, height: 602 }, 2);
                })
                .then(comparisonInfo => {
                    expect(comparisonInfo.result).eql(true, JSON.stringify(comparisonInfo));

                    return assertionHelper.removeScreenshotDir();
                })
                .finally(() => {
                    return testCafe.close();
                });
        });
    });
}
