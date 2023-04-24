const createTestCafe = require('../../../../lib');
const path           = require('path');
const config         = require('../../config.js');

let testCafe = null;

async function runTest ({ browsers, test, nativeAutomation }) {
    const runner = testCafe.createRunner();
    const source = path.join(__dirname, './testcafe-fixtures/index.js');

    const failedCount = await runner.browsers(browsers)
        .src(source)
        .filter(testName => {
            return testName ? test === testName : true;
        })
        .run({ nativeAutomation });

    if (failedCount)
        throw new Error('Error has occurred.');
}

const REQUIRED_BROWSERS = ['chrome', 'firefox'];
const currentBrowsers   = config.browsers.map(browser => browser.alias);

const thereAreAllRequiredBrowsers = REQUIRED_BROWSERS.every(requiredBrowser => currentBrowsers.includes(requiredBrowser));

if (thereAreAllRequiredBrowsers) {
    describe('Native automation', function () {
        beforeEach(async () => {
            testCafe = await createTestCafe('127.0.0.1', 1335, 1336);
        });

        afterEach(async () => {
            await testCafe.close();
        });

        it('Disabled by-default', function () {
            return runTest({ browsers: 'chrome', test: 'Disabled' });
        });

        it('Enabled with the "nativeAutomation" option', function () {
            return runTest({ browsers: 'chrome', test: 'Enabled', nativeAutomation: true });
        });
    });
}

