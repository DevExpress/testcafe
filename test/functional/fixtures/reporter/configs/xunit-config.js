const config = require('../../../config');

module.exports = {
    hostname:          config.testCafe.hostname,
    port1:             1335,
    port2:             1336,
    developmentMode:   config.devMode,
    retryTestPages:    config.retryTestPages,
    experimentalDebug: !!process.env.EXPERIMENTAL_DEBUG,
    isProxyless:       config.isProxyless,
    src:               './test/functional/fixtures/reporter/testcafe-fixtures/index-test.js',
    selectorTimeout:   200,
    assertionTimeout:  1000,
    pageLoadTimeout:   0,
    reporter:          {
        name:   'xunit',
        output: './test/functional/fixtures/reporter/report.xml',
    },
    filter: {
        test: 'Simple test',
    },
    ...config.currentEnvironment,
    browsers: config.browsers.map(browser => browser.browserName),
};
