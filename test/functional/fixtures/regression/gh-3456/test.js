const config          = require('../../../config');
const path            = require('path');
const { expect }      = require('chai');
const assertionHelper = require('../../../assertion-helper.js');

const SCREENSHOTS_PATH = path.resolve(assertionHelper.SCREENSHOTS_PATH);

if (config.useLocalBrowsers) {
    describe('--window-size arg in Headless mode (GH-3456)', function () {
        it(':headless', () => {
            const browsers = [
                'chrome:headless --window-size=501,602',
                'chrome --headless --window-size=501,602'
            ];

            const runner      = testCafe.createRunner();
            const fixturePath = path.join(__dirname, '/testcafe-fixtures/index.js');

            return runner
                .src(fixturePath)
                .browsers(browsers)
                .screenshots(SCREENSHOTS_PATH)
                .run()
                .then(failedCount => {
                    expect(failedCount).eql(0);

                    return assertionHelper.checkScreenshotsDimensions({ width: 501, height: 602 }, 2);
                })
                .then(dimensionsCorrect => {
                    expect(dimensionsCorrect).eql(true);

                    return assertionHelper.removeScreenshotDir();
                });
        });
    });
}
