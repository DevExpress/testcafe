const delay      = require('../../../../../../../lib/utils/delay');
const config     = require('../../../../../config');
const path       = require('path');
const { expect } = require('chai');

module.exports = {
    hostname:          config.testCafe.hostname,
    port1:             1335,
    port2:             1336,
    developmentMode:   config.devMode,
    retryTestPages:    config.retryTestPages,
    experimentalDebug: !!process.env.EXPERIMENTAL_DEBUG,
    isProxyless:       config.isProxyless,
    src:               path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/test-run-test.js'),
    selectorTimeout:   200,
    assertionTimeout:  1000,
    pageLoadTimeout:   0,
    hooks:             {
        testRun: {
            before: async (ctx) => {
                await delay(100);

                ctx.testRunBefore = 1;
                ctx.testRunAfter  = 0;
            },
            after: async (ctx) => {
                await delay(100);

                ctx.testRunAfter++;

                expect(ctx.testsCompleted).eql(3);
                expect(ctx.testRunBefore).eql(1);
                expect(ctx.testRunAfter).eql(1);
            },
        },
    },
    ...config.currentEnvironment,
    browsers: config.currentEnvironment.browsers.map(item => item.browserName),
};
