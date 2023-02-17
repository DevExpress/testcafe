const path               = require('path');
const createTestCafe     = require('../../../../../lib');
const { createReporter } = require('../../../utils/reporter');

let testcafe               = null;
const shouldAttachReporter = !!process.env.CUSTOM_REPORTER;

const reporter = createReporter({
    reportTaskDone: () => {
        process.stdout.write('reportTaskDone');
    },
});

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
            .reporter(shouldAttachReporter ? reporter : [])
            .run();
    })
    .catch(function () {
        return testcafe.close();
    });
