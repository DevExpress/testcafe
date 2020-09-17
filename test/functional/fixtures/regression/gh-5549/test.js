const createTestCafe = require('../../../../../lib');
const config         = require('../../../config');
const path           = require('path');

let testCafe = null;

if (config.useLocalBrowsers) {
    describe(`[Regression](GH-5449) Should not crash if TestCafe is created via "createTestCafe('null')"`, () => {
        it(`[Regression](GH-5449) Should not crash if TestCafe is created via "createTestCafe('null')"`, () => {
            return createTestCafe(null)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    return testCafe
                        .createRunner()
                        .browsers('chrome:headless')
                        .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                        .run();
                })
                .then(failedCount => {
                    testCafe.close();

                    if (failedCount)
                        throw new Error('Error occurred');
                });
        });
    });
}
