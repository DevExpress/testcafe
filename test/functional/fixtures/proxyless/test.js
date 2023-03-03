const createTestCafe = require('../../../../lib');
const path           = require('path');

async function runTest ({ browsers, test, disableProxyless }) {
    const testCafe = await createTestCafe('127.0.0.1', 1335, 1336);
    const runner   = testCafe.createRunner();
    const source   = path.join(__dirname, './testcafe-fixtures/index.js');

    const failedCount = await runner.browsers(browsers)
        .src(source)
        .filter(testName => {
            return testName ? test === testName : true;
        })
        .run({ disableProxyless });

    await testCafe.close();

    if (failedCount)
        throw new Error('Error has occurred');
}

describe('Proxyless', function () {
    it('Enabled by-default', function () {
        return runTest({ browsers: 'chrome', test: 'Enabled' });
    });

    it('Disabled with the "disableProxyless" option', function () {
        return runTest({ browsers: 'chrome', test: 'Disabled', disableProxyless: true });
    });

    it('Disabled on run with Chrome and Firefox browsers', function () {
        return runTest({ browsers: ['chrome', 'firefox'], test: 'Disabled' });
    });

    it('Disabled on Firefox browser with the "disableProxyless" option', function () {
        return runTest({ browsers: 'firefox', test: 'Disabled', disableProxyless: true });
    });
});
