const path           = require('path');
const createTestCafe = require('../../../../../lib');
const config         = require('../../../config.js');

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    describe('[Regression](GH-3929) - Should reconnect with bad network conditions', function () {
        this.timeout(60000);

        it('Should reconnect with bad network conditions', function () {
            let failedCount = 0;

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    return testCafe.createRunner()
                        .browsers(`chrome`)
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
