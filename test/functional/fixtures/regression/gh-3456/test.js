const createTestCafe = require('../../../../../lib');
const config          = require('../../../config');
/* eslint-disable */
const path            = require('path');
const { expect }      = require('chai');
const assertionHelper = require('../../../assertion-helper.js');

const SCREENSHOTS_PATH = path.resolve(assertionHelper.SCREENSHOTS_PATH);

if (config.useLocalBrowsers) {
    describe.only('[Regression](GH-3456) Should process --window-size arg in Headless mode ', function () {
        it(':headless', () => {
            const browsers = [
                'chrome:headless --window-size=501,602',
                'chrome --headless --window-size=501,602',
            ];

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    const runner      = testCafe.createRunner();
                    const fixturePath = path.join(__dirname, '/testcafe-fixtures/index.js');

                    console.log(`file: test.js -> line 30 -> .then -> SCREENSHOTS_PATH`, SCREENSHOTS_PATH);
                    return runner
                        .src(fixturePath)
                        .browsers(browsers)
                        .screenshots(SCREENSHOTS_PATH)
                        .run();
                })
                .then(failedCount => {
                    expect(failedCount).eql(0);

                    return assertionHelper.checkScreenshotsDimensions({ width: 501, height: 602 }, 2);
                })
                .then(dimensionsCorrect => {
                    expect(dimensionsCorrect).eql(true);

                    return assertionHelper.removeScreenshotDir();
                })
                .finally(() => {
                    return testCafe.close();
                });
        });
    });
}
