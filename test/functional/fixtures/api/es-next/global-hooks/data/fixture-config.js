const delay  = require('../../../../../../../lib/utils/delay');
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
    src:               path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/fixture-test.js'),
    selectorTimeout:   200,
    assertionTimeout:  1000,
    pageLoadTimeout:   0,
    hooks:             {
        fixture: {
            before: async () => {
                await delay(100);

                global.fixtureBefore++;
            },
            after: async () => {
                await delay(100);

                global.fixtureAfter++;
            },
        },
    },
    ...config.currentEnvironment,
    browsers: config.currentEnvironment.browsers.map(item => item.browserName),
};
