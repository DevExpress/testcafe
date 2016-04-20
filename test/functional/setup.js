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


const FUNCTIONAL_TESTS_ELEMENT_AVAILABILITY_TIMEOUT = 200;


function initBrowsersInfo (tc) {
    browsersInfo = config.browsers
        .filter(function (browser) {
            return config.isTravisTask || !browser.remoteOnly;
        })
        .map(function (settings) {
            return {
                settings:   settings,
                connection: tc.createBrowserConnection()
            };
        });
}

function openRemoteBrowsers () {
    slConnector = new SauceLabsConnector(config.sauceLabs.username, config.sauceLabs.accessKey);

    return slConnector
        .connect()
        .then(function () {
            var openBrowserPromises = browsersInfo.map(function (browserInfo) {
                return slConnector.startBrowser(browserInfo.settings, browserInfo.connection.url,
                    config.sauceLabs.jobName);
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
    return createTestCafe(config.testCafe.hostname, config.testCafe.port1, config.testCafe.port2)
        .then(function (tc) {
            testCafe = tc;

            initBrowsersInfo(tc);
            site.create(config.site.port1, config.site.port2, config.site.viewsPath);

            if (config.isTravisTask)
                return openRemoteBrowsers();

            return openLocalBrowsers();
        })
        .then(function () {
            global.testReport = null;

            global.runTests = function (fixture, testName, opts) {
                var report                     = '';
                var runner                     = testCafe.createRunner();
                var fixturePath                = path.join(path.dirname(caller()), fixture);
                var skipJsErrors               = opts && opts.skipJsErrors;
                var quarantineMode             = opts && opts.quarantineMode;
                var elementAvailabilityTimeout = opts && opts.elementAvailabilityTimeout ||
                                                 FUNCTIONAL_TESTS_ELEMENT_AVAILABILITY_TIMEOUT;
                var skipOption                 = opts && opts.skip;
                var onlyOption                 = opts && opts.only;

                var actualBrowsers = browsersInfo.filter(function (browserInfo) {
                    var only = onlyOption ? onlyOption.indexOf(browserInfo.settings.alias) > -1 : true;
                    var skip = skipOption ? skipOption.indexOf(browserInfo.settings.alias) > -1 : false;

                    return only && !skip;
                });

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
                    .run({
                        skipJsErrors:               skipJsErrors,
                        quarantineMode:             quarantineMode,
                        elementAvailabilityTimeout: elementAvailabilityTimeout
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

    if (config.isTravisTask)
        return closeRemoteBrowsers();

    return closeLocalBrowsers();
});
