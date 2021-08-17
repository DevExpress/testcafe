const config = require('../../../../../config');
const path   = require('path');

module.exports = {
    hostname:          config.testCafe.hostname,
    port1:             1335,
    port2:             1336,
    developmentMode:   config.devMode,
    retryTestPages:    config.retryTestPages,
    experimentalDebug: !!process.env.EXPERIMENTAL_DEBUG,
    isProxyless:       config.isProxyless,
    src:               path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/test-test.js'),
    selectorTimeout:   200,
    assertionTimeout:  1000,
    pageLoadTimeout:   0,
    hooks:             {
        test: {
            before: async (t) => {
                await t
                    .click('#beforeEach')
                    .wait(100);

                t.fixtureCtx.testBefore = t.fixtureCtx.testBefore ? t.fixtureCtx.testBefore + 1 : 1;
                t.fixtureCtx.testAfter  = t.fixtureCtx.testAfter || 0;
            },
            after: async (t) => {
                await t
                    .click('#afterEach')
                    .wait(100);

                t.fixtureCtx.testAfter++;
            },
        },
    },
    ...config.currentEnvironment,
    browsers: config.currentEnvironment.browsers.map(item => item.browserName),
};
