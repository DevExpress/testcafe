var browserTools   = require('testcafe-browser-tools');
var SlConnector    = require('saucelabs-connector');
var BsConnector    = require('browserstack-connector');
var Promise        = require('pinkie');
var caller         = require('caller');
var path           = require('path');
var promisifyEvent = require('promisify-event');
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

const BROWSER_OPENING_TIMEOUT = 90000;

const FUNCTIONAL_TESTS_SELECTOR_TIMEOUT  = 200;
const FUNCTIONAL_TESTS_ASSERTION_TIMEOUT = 1000;
const FUNCTIONAL_TESTS_PAGE_LOAD_TIMEOUT = 0;

var envName         = process.env.TESTING_ENVIRONMENT || config.testingEnvironmentNames.localBrowsers;
var environment     = config.testingEnvironments[envName];
var browserProvider = process.env.BROWSER_PROVIDER;
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

    connector = new Connector(environment[browserProvider].username, environment[browserProvider].accessKey,
        { servicePort: config.browserstackConnectorServicePort });

    return connector
        .connect()
        .then(function () {
            return connector.waitForFreeMachines(REQUESTED_MACHINES_COUNT,
                WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL, WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT);
        })
        .then(function () {
            var buildInfo = {
                jobName: environment.jobName,
                build:   process.env.TRAVIS_BUILD_ID || '',
                tags:    [process.env.TRAVIS_BRANCH || 'master']
            };

            var openBrowserPromises = browsersInfo.map(function (browserInfo) {
                return connector.startBrowser(browserInfo.settings, browserInfo.connection.url, buildInfo,
                    isBrowserStack ? { openingTimeout: BROWSER_OPENING_TIMEOUT } : null);
            });

            return Promise.all(openBrowserPromises);
        })
        .then(function (browsers) {
            browserInstances = browsers;
        });
}

function openLocalBrowsers () {
    var openBrowserPromises = browsersInfo.map(function (browserInfo) {
        return browserTools.getBrowserInfo(browserInfo.settings.alias)
            .then(function (browser) {
                var browserOpenedPromise = promisifyEvent(browserInfo.connection, 'opened');

                return browserTools
                    .open(browser, browserInfo.connection.url)
                    .then(function () {
                        return browserOpenedPromise;
                    });
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

    mocha.timeout(60000);

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

            site.create(config.site.ports, config.site.viewsPath);

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
            global.testCafe   = testCafe;

            global.runTests = function (fixture, testName, opts) {
                var report             = '';
                var runner             = testCafe.createRunner();
                var fixturePath        = typeof fixture !== 'string' || path.isAbsolute(fixture) ? fixture : path.join(path.dirname(caller()), fixture);
                var skipJsErrors       = opts && opts.skipJsErrors;
                var quarantineMode     = opts && opts.quarantineMode;
                var selectorTimeout    = opts && opts.selectorTimeout || FUNCTIONAL_TESTS_SELECTOR_TIMEOUT;
                var assertionTimeout   = opts && opts.assertionTimeout || FUNCTIONAL_TESTS_ASSERTION_TIMEOUT;
                var pageLoadTimeout    = opts && opts.pageLoadTimeout || FUNCTIONAL_TESTS_PAGE_LOAD_TIMEOUT;
                var onlyOption         = opts && opts.only;
                var skipOption         = opts && opts.skip;
                var screenshotPath     = opts && opts.setScreenshotPath ? '___test-screenshots___' : '';
                var screenshotsOnFails = opts && opts.screenshotsOnFails;
                var speed              = opts && opts.speed;
                var appCommand         = opts && opts.appCommand;
                var appInitDelay       = opts && opts.appInitDelay;
                var externalProxyHost  = opts && opts.useProxy;
                var proxyBypass        = opts && opts.proxyBypass;
                var customReporters    = opts && opts.reporters;

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

                var handleError = function (err) {
                    var shouldFail = opts && opts.shouldFail;

                    if (shouldFail && !err)
                        throw new Error('Test should have failed but it succeeded');

                    if (err)
                        throw err;
                };

                if (customReporters)
                    customReporters.forEach(r => runner.reporter(r.reporter, r.outStream));
                else {
                    runner.reporter('json', {
                        write: function (data) {
                            report += data;
                        },

                        end: function (data) {
                            report += data;
                        }
                    });
                }

                return runner
                    .useProxy(externalProxyHost, proxyBypass)
                    .browsers(connections)
                    .filter(function (test) {
                        return testName ? test === testName : true;
                    })
                    .src(fixturePath)
                    .screenshots(screenshotPath, screenshotsOnFails)
                    .startApp(appCommand, appInitDelay)
                    .run({
                        skipJsErrors:     skipJsErrors,
                        quarantineMode:   quarantineMode,
                        selectorTimeout:  selectorTimeout,
                        assertionTimeout: assertionTimeout,
                        pageLoadTimeout:  pageLoadTimeout,
                        speed:            speed
                    })
                    .then(function () {
                        if (customReporters)
                            return;

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
    this.timeout(60000);

    testCafe.close();
    site.destroy();

    delete global.testcafe;
    delete global.runTests;
    delete global.testReport;

    if (!config.useLocalBrowsers)
        return closeRemoteBrowsers();

    return closeLocalBrowsers();
});

// TODO: Run takeScreenshot tests first because other tests heavily impact them
if (envName === config.testingEnvironmentNames.localBrowsers) {
    require('./fixtures/api/es-next/take-screenshot/test');
    require('./fixtures/screenshots-on-fails/test');
}

