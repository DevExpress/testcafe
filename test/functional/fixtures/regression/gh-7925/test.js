const path                       = require('path');
const { expect }                 = require('chai');
const createTestCafe             = require('../../../../../lib');
const { onlyInNativeAutomation } = require('../../../utils/skip-in');

const EXPECTED_ERROR = 'When TestCafe uses native automation, it cannot apply the "userProfile" option. ' +
                       'To continue, disable native automation, or remove the "userProfile" suffix for ' +
                       'the following browsers: "chrome:userProfile".';

let testcafe = null;
let error = null;

function runTests (browsers) {
    error = null;

    return createTestCafe('127.0.0.1', 1335, 1336)
        .then(tc => {
            testcafe = tc;
        })
        .then(() => {
            return testcafe.createRunner()
                .browsers(browsers)
                .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                .run();
        })
        .catch(err => {
            error = err;
        })
        .finally(() => {
            return testcafe.close();
        });
}

describe('[Regression](GH-7925) Browsers with "userProfile" option in Native Automation', function () {
    onlyInNativeAutomation('chrome:userProfile', function () {
        return runTests(['chrome:userProfile'])
            .then(() => {
                expect(error.message).contains(EXPECTED_ERROR);
            });
    });

    onlyInNativeAutomation('chrome:userProfile + firefox', function () {
        return runTests(['chrome:userProfile', 'firefox'])
            .then(() => {
                expect(error).eql(null);
            });
    });
});


