var browserTools   = require('testcafe-browser-tools');
var SlConnector    = require('saucelabs-connector');
var BsConnector    = require('../../modules/browserstack-connector');
var Promise        = require('pinkie');
var caller         = require('caller');
var path           = require('path');
var createTestCafe = require('../../lib');
var config         = require('./config.js');
var site           = require('./site');
var getTestError   = require('./get-test-error.js');

var testCafe     = null;
var browsersInfo = null;

var connector        = null;
var browserInstances = null;

const WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL  = 60000;
const WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT = 60;

const FUNCTIONAL_TESTS_SELECTOR_TIMEOUT  = 200;
const FUNCTIONAL_TESTS_ASSERTION_TIMEOUT = 1000;

var envName         = process.env.TESTING_ENVIRONMENT || config.testingEnvironmentNames.localBrowsers;
var environment     = config.testingEnvironments[envName];
var browserProvider = process.env.browserProvider;
var isBrowserStack  = browserProvider === config.browserProviderNames.browserstack;

config.browsers = environment.browsers;

const REQUESTED_MACHINES_COUNT = environment.browsers.length;


function getBrowserInfo (settings) {
    return testCafe
        .createBrowserConnection()
        .then(function (connection) {
            return {
                settings:   settings,
                connection: connection
            };
        });
}

function initBrowsersInfo () {
    return Promise
        .all(environment.browsers.map(getBrowserInfo))
        .then(function (info) {
            browsersInfo = info;
        });
}

function openRemoteBrowsers () {
    var Connector = isBrowserStack ? BsConnector : SlConnector;

    connector = new Connector(environment[browserProvider].username, environment[browserProvider].accessKey);

    return connector
        .connect()
        .then(function () {
            return connector.waitForFreeMachines(REQUESTED_MACHINES_COUNT,
                WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL, WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT);
        })
        .then(function () {
            var hubUrl = 'http://' + 'localhost' + ':' + config.site.port1 + '/hub';

            var openBrowserPromises = browsersInfo.map(function (browserInfo) {
                if (isBrowserStack) {
                    site.addUrlToHub(browserInfo.connection.url);
                    browserInfo.settings.build = process.env.TRAVIS_BUILD_ID;
                }

                return connector.startBrowser(browserInfo.settings, isBrowserStack ? hubUrl : browserInfo.connection.url,
                    isBrowserStack ? { jobName: environment.jobName } : environment.jobName);
            });

            return Promise.all(openBrowserPromises);
        })
        .then(function (browsers) {
            browserInstances = browsers;

            return isBrowserStack ? site.waitHubEstablish() : null;
        });
}

function openLocalBrowsers () {
    var openBrowserPromises = browsersInfo.map(function (browserInfo) {
        return browserTools.getBrowserInfo(browserInfo.settings.alias)
            .then(function (browser) {
                return browserTools.open(browser, browserInfo.connection.url);
            });
    });

    return Promise.all(openBrowserPromises);
}

function closeRemoteBrowsers () {
    var closeBrowserPromises = browserInstances.map(function (browser) {
        return connector.stopBrowser(isBrowserStack ? browser.id : browser);
    });

    return Promise.all(closeBrowserPromises)
        .then(function () {
            return connector.disconnect();
        });
}

function closeLocalBrowsers () {
    var closeBrowserPromises = browsersInfo.map(function (browserInfo) {
        return browserInfo.connection.getStatus().then(function (status) {
            return browserTools.close(status.url);
        });
    });

    return Promise.all(closeBrowserPromises);
}

before(function () {
    var mocha = this;

    return createTestCafe(config.testCafe.hostname, config.testCafe.port1, config.testCafe.port2)
        .then(function (tc) {
            testCafe = tc;

            return initBrowsersInfo();
        })
        .then(function () {
            var aliases = browsersInfo.map(function (browser) {
                return browser.settings.alias;
            });

            process.stdout.write('Running tests in browsers: ' + aliases.join(', ') + '\n');

            site.create(config.site.port1, config.site.port2, config.site.port3, config.site.port4, config.site.viewsPath);

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
                var assertionTimeout   = opts && opts.assertionTimeout || FUNCTIONAL_TESTS_ASSERTION_TIMEOUT;
                var onlyOption         = opts && opts.only;
                var skipOption         = opts && opts.skip;
                var screenshotPath     = opts && opts.setScreenshotPath ? '___test-screenshots___' : '';
                var screenshotsOnFails = opts && opts.screenshotsOnFails;
                var speed              = opts && opts.speed;
                var appCommand         = opts && opts.appCommand;
                var appInitDelay       = opts && opts.appInitDelay;

                var actualBrowsers = browsersInfo.filter(function (browserInfo) {

                    /* eslint-disable no-console */
                    console.log(browserInfo.settings);
                    console.log(onlyOption);
                    console.log(skipOption);
                    /* eslint-enable no-console */

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

                var handleError = function (err) {
                    var shouldFail = opts && opts.shouldFail;

                    if (shouldFail && !err)
                        throw new Error('Test should have failed but it succeeded');

                    if (err)
                        throw err;
                };

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
                    .startApp(appCommand, appInitDelay)
                    .run({
                        skipJsErrors:     skipJsErrors,
                        quarantineMode:   quarantineMode,
                        selectorTimeout:  selectorTimeout,
                        assertionTimeout: assertionTimeout,
                        speed:            speed
                    })
                    .then(function () {
                        var taskReport = JSON.parse(report);
                        var errorDescr = getTestError(taskReport, actualBrowsers);
                        var testReport = taskReport.fixtures.length === 1 ?
                                         taskReport.fixtures[0].tests[0] :
                                         taskReport;

                        testReport.warnings = taskReport.warnings;

                        global.testReport = testReport;

                        handleError(errorDescr);
                    })
                    .catch(handleError);
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
