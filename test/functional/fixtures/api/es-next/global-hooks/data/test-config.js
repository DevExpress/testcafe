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
    src:               path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/test.js'),
    selectorTimeout:   200,
    assertionTimeout:  1000,
    pageLoadTimeout:   0,
    hooks:             {
        test: {
            before: async (t) => {
                await t
                    .click('#beforeEach')
                    .wait(100);

                t.ctx.testBefore = t.ctx.testBefore ? t.ctx.testBefore + 1 : 1;
                t.ctx.testAfter  = t.ctx.testAfter || 0;
            },
            after: async (t) => {
                await t
                    .click('#afterEach')
                    .wait(100);

                t.ctx.testAfter++;
            },
        },
    },
    ...config.currentEnvironment,
    browsers: config.currentEnvironment.browsers.map(item => item.browserName),
};
