const path                = require('path');
const Promise             = require('pinkie');
const expect              = require('chai').expect;
const config              = require('../../../config');
const browserProviderPool = require('../../../../../lib/browser/provider/pool');
const BrowserConnection   = require('../../../../../lib/browser/connection');

let hasErrors = true;

function customReporter () {
    return {
        reportTestDone (name, testRunInfo) {
            hasErrors = !!testRunInfo.errs.length;
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
    describe('Browser reconnect', function () {
        async function run (pathToTest) {
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
                        .reporter(customReporter)
                        .browsers(connection)
                        .run().then(() => {
                            expect(hasErrors).to.be.false;
                        });
                });
        }

        it.only('Should restart browser when it does not respond', function () {
            return run('./testcafe-fixtures/index-test.js');
        });
    });
}

