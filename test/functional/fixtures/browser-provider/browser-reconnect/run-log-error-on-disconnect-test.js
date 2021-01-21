const path           = require('path');
const createTestCafe = require('../../../../../lib');

let testcafe = null;

createTestCafe()
    .then(function (tc) {
        testcafe = tc;

        return testcafe
            .createRunner()
            .browsers('chrome:headless')
            .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
            .filter(function (testName) {
                return testName === 'Should log error on browser disconnect';
            })
            .run();
    })
    .catch(function () {
        return testcafe.close();
    });
