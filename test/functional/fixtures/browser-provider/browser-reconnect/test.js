const path                = require('path');
const { expect }          = require('chai');
const config              = require('../../../config');
const browserProviderPool = require('../../../../../lib/browser/provider/pool');
const BrowserConnection   = require('../../../../../lib/browser/connection');
const { createReporter }  = require('../../../utils/reporter');


let errors = null;

const reporter = createReporter({
    reportTestDone (name, testRunInfo) {
        errors = testRunInfo.errs;
    }
});

function createConnection (browser) {
    return browserProviderPool
        .getBrowserInfo(browser)
        .then(browserInfo => new BrowserConnection(testCafe.browserConnectionGateway, browserInfo, false));
}

function run (pathToTest, filter) {
    const src          = path.join(__dirname, pathToTest);
    const browserNames = config.currentEnvironment.browsers.map(browser => browser.browserName || browser.alias);

    return Promise.all(browserNames.map(browser => createConnection(browser)))
        .then(connections => {
            connections.forEach(connection => {
                connection.HEARTBEAT_TIMEOUT = 4000;
            });

            return connections;
        })
        .then(connection => {
            return testCafe
                .createRunner()
                .src(src)
                .filter(testName => testName === filter)
                .reporter(reporter)
                .browsers(connection)
                .run();
        });
}

describe('Browser reconnect', function () {
    if (config.useLocalBrowsers) {
        it('Should restart browser when it does not respond', function () {
            return run('./testcafe-fixtures/index-test.js', 'Should restart browser when it does not respond')
                .then(() => {
                    expect(errors.length).eql(0);
                });
        });

        it('Should fail on 3 disconnects in one browser', function () {
            return run('./testcafe-fixtures/index-test.js', 'Should fail on 3 disconnects in one browser')
                .then(() => {
                    throw new Error('Test should have failed but it succeeded');
                })
                .catch(err => {
                    expect(err.message).contains('browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues');
                });
        });
    }
});
