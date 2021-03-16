const createTestCafe = require('../../../../../lib');
const config         = require('../../../config');
const path           = require('path');

let testCafe = null;

if (config.useLocalBrowsers) {
    describe(`[Regression](GH-5449) Should not crash if TestCafe is created via "createTestCafe('null')"`, () => {
        it(`[Regression](GH-5449) Should not crash if TestCafe is created via "createTestCafe('null')"`, () => {
            let failedCount = 0;

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
                .then(failed => {
                    failedCount = failed;

                    return testCafe.close();
                })
                .then(() => {
                    if (failedCount)
                        throw new Error('Error occurred');
                });
        });
    });
}
