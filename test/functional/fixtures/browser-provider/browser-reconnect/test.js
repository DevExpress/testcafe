const path                = require('path');
const Promise             = require('pinkie');
const expect              = require('chai').expect;
const config              = require('../../../config');
const browserProviderPool = require('../../../../../lib/browser/provider/pool');
const BrowserConnection   = require('../../../../../lib/browser/connection');

let errors = null;

function customReporter () {
    return {
        reportTestDone (name, testRunInfo) {
            errors = testRunInfo.errs;
        },
        reportFixtureStart () {
        },
        reportTaskStart () {
        },
        reportTaskDone () {
        }
    };
}

if (config.useLocalBrowsers) {
    describe.only('Browser reconnect', function () {
        async function run (pathToTest, filter) {
            const src     = path.join(__dirname, pathToTest);
            const aliases = config.currentEnvironment.browsers.map(browser => browser.alias);

            return Promise.all(aliases.map(alias => browserProviderPool.getBrowserInfo(alias)))
                .then(browsers => {
                    const connections = browsers.map(browser => new BrowserConnection(testCafe.browserConnectionGateway, browser, true));

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
                        .reporter(customReporter)
                        .browsers(connection)
                        .run();
                });
        }

        it('Should restart browser when it does not respond', function () {
            return run('./testcafe-fixtures/index-test.js', 'Should restart browser when it does not respond')
                .then(() => {
                    expect(errors.length).eql(0);
                });
        });

        it('Should fail on 3 disconnects', function () {
            return run('./testcafe-fixtures/index-test.js', 'Should fail on 3 disconnects')
                .then(() => {
                    throw new Error('Test should have failed but it succeeded');
                })
                .catch(err => {
                    expect(err.message).contains('browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues');
                });
        });
    });
}

