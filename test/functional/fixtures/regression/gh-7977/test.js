const createTestCafe             = require('../../../../../lib');
const { onlyInNativeAutomation } = require('../../../utils/skip-in');
const path                       = require('path');
const expect                     = require('chai').expect;

const EXPECTED_REQUEST_COUNT = 300;

let testcafe = null;

describe('[Regression](GH-7977)', function () {
    onlyInNativeAutomation('Should log all concurrent requests', function () {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testcafe = tc;
            })
            .then(() => {
                return testcafe.createRunner()
                    .browsers(`chrome:headless`)
                    .concurrency(3)
                    .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                    .run();
            })
            .then(() => {
                return testcafe.close();
            })
            .then(() => {
                expect(require('./testcafe-fixtures/requestCounter').get()).eql(EXPECTED_REQUEST_COUNT);
            });
    });
});
