const path            = require('path');
const { expect }      = require('chai');
const createTestCafe  = require('../../../../../lib');
const config          = require('../../../config');

const needSkip = !config.hasBrowser('firefox');

function getFirefoxBrowserName () {
    const firefoxSettings = config.currentEnvironment.browsers.find(browser => browser.alias.includes('firefox'));

    return firefoxSettings ? firefoxSettings.browserName : 'firefox';
}

async function runFirefoxProxyModeCryptoTest () {
    // NOTE: host is intentionally unset to exercise the hostname calculation path.
    const testCafe = await createTestCafe({ port1: 1335, port2: 1336 });

    try {
        const failedCount = await testCafe
            .createRunner()
            .src(path.join(__dirname, 'testcafe-fixtures/index.js'))
            .browsers(getFirefoxBrowserName())
            .run({
                disableNativeAutomation: true,
                pageLoadTimeout:         45000,
                selectorTimeout:         5000,
                testExecutionTimeout:    120000,
            });

        expect(failedCount).eql(0);
    }
    finally {
        await testCafe.close();
    }
}

(needSkip ? describe.skip : describe)('[Regression](GH-8391)', function () {
    it('Should keep WebCrypto available in Firefox proxy mode when all browsers are local', function () {
        return runFirefoxProxyModeCryptoTest();
    });
});
