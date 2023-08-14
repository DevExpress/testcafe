const path                       = require('path');
const { onlyInNativeAutomation } = require('../../../utils/skip-in');
const createTestCafe             = require('../../../../../lib');

let testcafe = null;
let failedCount = 0;

describe('[Regression](GH-7770)', function () {
    onlyInNativeAutomation('Should handle iframe + worker in Native Automation mode (headless)', function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testcafe = tc;
            })
            .then(() => {
                return testcafe.createRunner()
                    .browsers(`chrome:headless`)
                    .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                    .run();
            })
            .then(failed => {
                failedCount = failed;

                return testcafe.close();
            })
            .then(() => {
                if (failedCount)
                    throw new Error('Error occurred');
            });
    });

    onlyInNativeAutomation('Should handle iframe + worker in Native Automation mode (headed)', function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testcafe = tc;
            })
            .then(() => {
                return testcafe.createRunner()
                    .browsers(`chrome`)
                    .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                    .run();
            })
            .then(failed => {
                failedCount = failed;

                return testcafe.close();
            })
            .then(() => {
                if (failedCount)
                    throw new Error('Error occurred');
            });
    });
});

