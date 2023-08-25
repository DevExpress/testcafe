const path               = require('path');
const createTestCafe     = require('../../../../../lib');
const { createReporter } = require('../../../utils/reporter');
const config             = require('../../../config');

let testcafe               = null;
const shouldAttachReporter = !!process.env.CUSTOM_REPORTER;
const browsers             = config.currentEnvironment.browsers.map(browserInfo => browserInfo.browserName);

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
            .browsers(browsers)
            .src(path.join(__dirname, './testcafe-fixtures/index-test.js'))
            .filter(function (testName) {
                return testName === 'Should log error on browser disconnect';
            })
            .reporter(shouldAttachReporter ? reporter : [])
            .run({ disableNativeAutomation: !config.nativeAutomation });
    })
    .catch(function () {
        return testcafe.close();
    });
