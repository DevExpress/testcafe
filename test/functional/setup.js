const path                       = require('path');
const Promise                    = require('pinkie');
const SlConnector                = require('saucelabs-connector');
const BsConnector                = require('browserstack-connector');
const caller                     = require('caller');
const promisifyEvent             = require('promisify-event');
const createTestCafe             = require('../../lib');
const browserProviderPool        = require('../../lib/browser/provider/pool');
const BrowserConnection          = require('../../lib/browser/connection');
const config                     = require('./config.js');
const site                       = require('./site');
const RemoteConnector            = require('./remote-connector');
const getTestError               = require('./get-test-error.js');
const { createSimpleTestStream } = require('./utils/stream');

let testCafe     = null;
let browsersInfo = null;

let connector        = null;
let browserInstances = null;

const WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL  = 60000;
const WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT = 60;

const BROWSER_OPENING_TIMEOUT = 90000;

const FUNCTIONAL_TESTS_SELECTOR_TIMEOUT  = 200;
const FUNCTIONAL_TESTS_ASSERTION_TIMEOUT = 1000;
const FUNCTIONAL_TESTS_PAGE_LOAD_TIMEOUT = 0;

const environment     = config.currentEnvironment;
const browserProvider = process.env.BROWSER_PROVIDER;
const isBrowserStack  = browserProvider === config.browserProviderNames.browserstack;

config.browsers = environment.browsers;

const REQUESTED_MACHINES_COUNT = environment.browsers.length;

const REMOTE_CONNECTORS_MAP = {
    [config.browserProviderNames.browserstack]: BsConnector,
    [config.browserProviderNames.sauceLabs]:    SlConnector,
    [config.browserProviderNames.remote]:       RemoteConnector
};

const USE_PROVIDER_POOL = config.useLocalBrowsers || isBrowserStack;

function getBrowserInfo (settings) {
    return Promise
        .resolve()
        .then(() => {
            if (!USE_PROVIDER_POOL)
                return testCafe.createBrowserConnection();

            return browserProviderPool
                .getBrowserInfo(settings.browserName)
                .then(browserInfo => new BrowserConnection(testCafe.browserConnectionGateway, browserInfo, true));
        })
        .then(connection => {
            return {
                settings:   settings,
                connection: connection
            };
        });
}

function initBrowsersInfo () {
    return Promise
        .all(environment.browsers.map(getBrowserInfo))
        .then(info => {
            browsersInfo = info;
        });
}

function openRemoteBrowsers () {
    const Connector = REMOTE_CONNECTORS_MAP[browserProvider];

    connector = new Connector(environment[browserProvider].username, environment[browserProvider].accessKey,
        { servicePort: config.browserstackConnectorServicePort });

    return connector
        .connect()
        .then(() => {
            return connector.waitForFreeMachines(REQUESTED_MACHINES_COUNT,
                WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL, WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT);
        })
        .then(() => {
            const buildInfo = {
                jobName: environment.jobName,
                build:   process.env.TRAVIS_BUILD_ID || '',
                tags:    [process.env.TRAVIS_BRANCH || 'master']
            };

            const openBrowserPromises = browsersInfo.map(browserInfo => {
                return connector.startBrowser(browserInfo.settings, browserInfo.connection.url, buildInfo,
                    isBrowserStack ? { openingTimeout: BROWSER_OPENING_TIMEOUT } : null);
            });

            return Promise.all(openBrowserPromises);
        })
        .then(browsers => {
            browserInstances = browsers;
        });
}

function waitUtilBrowserConnectionOpened (connection) {
    const connectedPromise = connection.opened ? Promise.resolve() : promisifyEvent(connection, 'opened');

    return connectedPromise
        .then(() => {
            // eslint-disable-next-line no-console
            console.log(`Connected ${connection.userAgent}`);
        });
}

function waitUntilBrowsersConnected () {
    return Promise.all(browsersInfo.map(browserInfo => waitUtilBrowserConnectionOpened(browserInfo.connection)));
}

function closeRemoteBrowsers () {
    const closeBrowserPromises = browserInstances.map(browser => connector.stopBrowser(isBrowserStack ? browser.id : browser));

    return Promise.all(closeBrowserPromises)
        .then(() => {
            return connector.disconnect();
        });
}

function closeLocalBrowsers () {
    const closeBrowserPromises = browsersInfo.map(browserInfo => {
        browserInfo.connection.close();

        return promisifyEvent(browserInfo.connection, 'closed');
    });

    return Promise.all(closeBrowserPromises);
}

before(function () {
    const mocha = this;

    mocha.timeout(60000);

    const { devMode, retryTestPages } = config;

    return createTestCafe(config.testCafe.hostname, config.testCafe.port1, config.testCafe.port2, null, devMode, retryTestPages)
        .then(function (tc) {
            testCafe = tc;

            return initBrowsersInfo();
        })
        .then(() => {
            const aliases = browsersInfo.map(browser => browser.settings.alias);

            process.stdout.write('Running tests in browsers: ' + aliases.join(', ') + '\n');

            site.create(config.site.ports, config.site.viewsPath);

            // NOTE: we need to disable this particular timeout for preventing mocha timeout
            // error while establishing connection to Sauce Labs. If connection wouldn't be
            // established after a specified number of attempts, an error will be thrown.
            if (isBrowserStack || !USE_PROVIDER_POOL)
                mocha.timeout(0);

            if (USE_PROVIDER_POOL)
                return Promise.resolve();

            return openRemoteBrowsers();
        })
        .then(() => {
            return waitUntilBrowsersConnected();
        })
        .then(() => {
            global.testReport = null;
            global.testCafe   = testCafe;

            global.runTests = (fixture, testName, opts) => {
                const stream                      = createSimpleTestStream();
                const runner                      = testCafe.createRunner();
                const fixturePath                 = typeof fixture !== 'string' ||
                                                    path.isAbsolute(fixture) ? fixture : path.join(path.dirname(caller()), fixture);
                const skipJsErrors                = opts && opts.skipJsErrors;
                const disablePageReloads          = opts && opts.disablePageReloads;
                const quarantineMode              = opts && opts.quarantineMode;
                const selectorTimeout             = opts && opts.selectorTimeout || FUNCTIONAL_TESTS_SELECTOR_TIMEOUT;
                const assertionTimeout            = opts && opts.assertionTimeout || FUNCTIONAL_TESTS_ASSERTION_TIMEOUT;
                const pageLoadTimeout             = opts && opts.pageLoadTimeout || FUNCTIONAL_TESTS_PAGE_LOAD_TIMEOUT;
                const onlyOption                  = opts && opts.only;
                const skipOption                  = opts && opts.skip;
                const screenshotPath              = opts && opts.setScreenshotPath ? config.testScreenshotsDir : '';
                const screenshotPathPattern       = opts && opts.screenshotPathPattern;
                const screenshotsOnFails          = opts && opts.screenshotsOnFails;
                const videoPath                   = opts && opts.setVideoPath ? config.testVideosDir : '';
                const videoOptions                = opts && opts.videoOptions;
                const videoEncodingOptions        = opts && opts.videoEncodingOptions;
                const speed                       = opts && opts.speed;
                const appCommand                  = opts && opts.appCommand;
                const appInitDelay                = opts && opts.appInitDelay;
                const proxy                       = opts && opts.useProxy;
                const proxyBypass                 = opts && opts.proxyBypass;
                const customReporters             = opts && opts.reporter;
                const skipUncaughtErrors          = opts && opts.skipUncaughtErrors;
                const stopOnFirstFail             = opts && opts.stopOnFirstFail;

                const actualBrowsers = browsersInfo.filter(browserInfo => {
                    const { alias, userAgent } = browserInfo.settings;

                    const only = onlyOption ? [alias, userAgent].some(prop => onlyOption.includes(prop)) : true;
                    const skip = skipOption ? [alias, userAgent].some(prop => skipOption.includes(prop)) : false;

                    return only && !skip;
                });

                if (!actualBrowsers.length) {
                    mocha.test.skip();
                    return Promise.resolve();
                }

                const connections = actualBrowsers.map(browserInfo => {
                    return browserInfo.connection;
                });

                const handleError = (err) => {
                    const shouldFail = opts && opts.shouldFail;

                    if (shouldFail && !err)
                        throw new Error('Test should have failed but it succeeded');

                    if (err)
                        throw err;
                };

                if (customReporters)
                    runner.reporter(customReporters);
                else
                    runner.reporter('json', stream);

                return runner
                    .useProxy(proxy, proxyBypass)
                    .browsers(connections)

                    .filter(test => {
                        return testName ? test === testName : true;
                    })
                    .src(fixturePath)
                    .screenshots(screenshotPath, screenshotsOnFails, screenshotPathPattern)
                    .video(videoPath, videoOptions, videoEncodingOptions)
                    .startApp(appCommand, appInitDelay)
                    .run({
                        skipJsErrors,
                        disablePageReloads,
                        quarantineMode,
                        selectorTimeout,
                        assertionTimeout,
                        pageLoadTimeout,
                        speed,
                        stopOnFirstFail,
                        skipUncaughtErrors
                    })
                    .then(failedCount => {
                        if (customReporters)
                            return;

                        const taskReport = JSON.parse(stream.data);
                        const errorDescr = getTestError(taskReport, actualBrowsers);
                        const testReport = taskReport.fixtures.length === 1 ?
                            taskReport.fixtures[0].tests[0] :
                            taskReport;

                        testReport.warnings   = taskReport.warnings;
                        testReport.failedCount = failedCount;

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

    if (!USE_PROVIDER_POOL)
        return closeRemoteBrowsers();

    return closeLocalBrowsers();
});

// TODO: Run takeScreenshot tests first because other tests heavily impact them
if (config.useLocalBrowsers && !config.isLegacyEnvironment) {
    require('./fixtures/api/es-next/take-screenshot/test');
    require('./fixtures/screenshots-on-fails/test');
}

