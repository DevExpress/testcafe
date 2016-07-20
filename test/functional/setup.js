var browserNatives     = require('testcafe-browser-natives');
var SauceLabsConnector = require('saucelabs-connector');
var Promise            = require('pinkie');
var caller             = require('caller');
var path               = require('path');
var createTestCafe     = require('../../lib');
var config             = require('./config.js');
var site               = require('./site');
var getTestError       = require('./get-test-error.js');

var testCafe     = null;
var browsersInfo = null;

var slConnector = null;
var slBrowsers  = null;

const WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL  = 60000;
const WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT = 60;

const FUNCTIONAL_TESTS_SELECTOR_TIMEOUT = 200;

var envName     = process.env.TESTING_ENVIRONMENT || config.testingEnvironmentNames.localBrowsers;
var environment = config.testingEnvironments[envName];

config.browsers = environment.browsers;

const SAUCE_LABS_REQUESTED_MACHINES_COUNT = environment.browsers.length;


function initBrowsersInfo (tc) {
    browsersInfo = environment.browsers
        .map(function (settings) {
            return {
                settings:   settings,
                connection: tc.createBrowserConnection()
            };
        });
}

function openRemoteBrowsers () {
    slConnector = new SauceLabsConnector(environment.sauceLabs.username, environment.sauceLabs.accessKey);

    return slConnector
        .connect()
        .then(function () {
            return slConnector.waitForFreeMachines(SAUCE_LABS_REQUESTED_MACHINES_COUNT,
                WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL, WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT);
        })
        .then(function () {
            var openBrowserPromises = browsersInfo.map(function (browserInfo) {
                return slConnector.startBrowser(browserInfo.settings, browserInfo.connection.url,
                    environment.sauceLabs.jobName);
            });

            return Promise.all(openBrowserPromises);
        })
        .then(function (browsers) {
            slBrowsers = browsers;
        });
}

function openLocalBrowsers () {
    var openBrowserPromises = browsersInfo.map(function (browserInfo) {
        return browserNatives.getBrowserInfo(browserInfo.settings.alias)
            .then(function (browser) {
                return browserNatives.open(browser, browserInfo.connection.url);
            });
    });

    return Promise.all(openBrowserPromises);
}

function closeRemoteBrowsers () {
    var closeBrowserPromises = slBrowsers.map(function (browser) {
        return slConnector.stopBrowser(browser);
    });

    return Promise.all(closeBrowserPromises)
        .then(function () {
            return slConnector.disconnect();
        });
}

function closeLocalBrowsers () {
    var closeBrowserPromises = browsersInfo.map(function (browserInfo) {
        return browserNatives.close(browserInfo.connection.getStatus().url);
    });

    return Promise.all(closeBrowserPromises);
}

before(function () {
    var mocha = this;

    return createTestCafe(config.testCafe.hostname, config.testCafe.port1, config.testCafe.port2)
        .then(function (tc) {
            testCafe = tc;

            initBrowsersInfo(tc);
            site.create(config.site.port1, config.site.port2, config.site.viewsPath);

            if (!config.useLocalBrowsers) {
                // NOTE: we need to disable this particular timeout for preventing mocha timeout
                // error while establishing connection to Sauce Labs. If connection wouldn't be
                // established after a specified number of attempts, an error will be thrown.
                mocha.timeout(0);

                return openRemoteBrowsers();
            }

            return openLocalBrowsers();
        })
        .then(function () {
            global.testReport = null;

            global.runTests = function (fixture, testName, opts) {
                var report             = '';
                var runner             = testCafe.createRunner();
                var fixturePath        = path.isAbsolute(fixture) ? fixture : path.join(path.dirname(caller()), fixture);
                var skipJsErrors       = opts && opts.skipJsErrors;
                var quarantineMode     = opts && opts.quarantineMode;
                var selectorTimeout    = opts && opts.selectorTimeout || FUNCTIONAL_TESTS_SELECTOR_TIMEOUT;
                var onlyOption         = opts && opts.only;
                var skipOption         = opts && opts.skip;
                var screenshotPath     = opts && opts.setScreenshotPath ? '___test-screenshots___' : '';
                var screenshotsOnFails = opts && opts.screenshotsOnFails;

                var actualBrowsers = browsersInfo.filter(function (browserInfo) {
                    var only = onlyOption ? onlyOption.indexOf(browserInfo.settings.alias) > -1 : true;
                    var skip = skipOption ? skipOption.indexOf(browserInfo.settings.alias) > -1 : false;

                    return only && !skip;
                });

                if (!actualBrowsers.length) {
                    mocha.test.skip();
                    return Promise.resolve();
                }

                var connections = actualBrowsers.map(function (browserInfo) {
                    return browserInfo.connection;
                });

                return runner
                    .browsers(connections)
                    .filter(function (test) {
                        return testName ? test === testName : true;
                    })
                    .reporter('json', {
                        write: function (data) {
                            report += data;
                        },

                        end: function (data) {
                            report += data;
                        }
                    })
                    .src(fixturePath)
                    .screenshots(screenshotPath, screenshotsOnFails)
                    .run({
                        skipJsErrors:    skipJsErrors,
                        quarantineMode:  quarantineMode,
                        selectorTimeout: selectorTimeout
                    })
                    .then(function () {
                        var testReport = JSON.parse(report).fixtures[0].tests[0];
                        var testError  = getTestError(testReport, actualBrowsers);
                        var shouldFail = opts && opts.shouldFail;

                        global.testReport = testReport;

                        if (shouldFail && !testError)
                            throw new Error('Test should have failed but it succeeded');

                        if (testError)
                            throw testError;
                    });
            };
        });
});

after(function () {
    testCafe.close();
    site.destroy();

    delete global.runTests;
    delete global.testReport;

    if (!config.useLocalBrowsers)
        return closeRemoteBrowsers();

    return closeLocalBrowsers();
});
