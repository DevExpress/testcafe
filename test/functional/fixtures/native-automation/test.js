const createTestCafe = require('../../../../lib');
const path           = require('path');
const config         = require('../../config.js');

let testCafeInstance = null;

async function runTest ({ browsers, src = './testcafe-fixtures/index.js', test, disableNativeAutomation = false }) {
    const runner = testCafeInstance.createRunner();
    const source = path.join(__dirname, src);

    const failedCount = await runner.browsers(browsers)
        .src(source)
        .filter(testName => {
            if (!test)
                return true;

            return test === testName;
        })
        .run({ disableNativeAutomation });

    if (failedCount)
        throw new Error('Error has occurred.');
}

const REQUIRED_BROWSERS = ['chrome', 'firefox'];
const currentBrowsers   = config.browsers.map(browser => browser.alias);

const thereAreAllRequiredBrowsers = REQUIRED_BROWSERS.every(requiredBrowser => currentBrowsers.includes(requiredBrowser));

if (thereAreAllRequiredBrowsers) {
    describe('Native automation', function () {
        beforeEach(async () => {
            testCafeInstance = await createTestCafe('127.0.0.1', 1335, 1336);
        });

        afterEach(async () => {
            await testCafeInstance.close();
        });

        it('Enabled by-default', function () {
            return runTest({ browsers: 'chrome', test: 'native url' });
        });

        it('Disabled with the "disableNativeAutomation" option', function () {
            return runTest({ browsers: 'chrome', test: 'proxy url', disableNativeAutomation: true });
        });

        it('fixture.disableNativeAutomation', function () {
            return runTest({ browsers: 'chrome', src: './testcafe-fixtures/fixture-api.js', test: 'proxy url' });
        });

        it('test.disableNativeAutomation', function () {
            return runTest({ browsers: 'chrome', src: './testcafe-fixtures/test-api.js', test: 'proxy url' });
        });
    });
}

