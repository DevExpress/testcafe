const path                       = require('path');
const createTestCafe             = require('../../../../../lib');
const { onlyInNativeAutomation } = require('../../../utils/skip-in');

let testcafe = null;

describe('[Regression](GH-7983)', function () {
    onlyInNativeAutomation('File protocol iframe in Native Automation', function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testcafe = tc;
            })
            .then(() => {
                return testcafe.createRunner()
                    .browsers('chrome:headless --allow-file-access-from-files')
                    .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                    .run();
            })
            .then(() => {
                return testcafe.close();
            });
    });
});
