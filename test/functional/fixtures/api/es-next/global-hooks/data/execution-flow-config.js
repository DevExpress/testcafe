const flowInfoStorage = require('../utils/flow-info-storage');
const config          = require('../../../../../config');
const path            = require('path');

module.exports = {
    hostname:          config.testCafe.hostname,
    port1:             1335,
    port2:             1336,
    developmentMode:   config.devMode,
    retryTestPages:    config.retryTestPages,
    experimentalDebug: !!process.env.EXPERIMENTAL_DEBUG,
    isProxyless:       config.isProxyless,
    src:               path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/flow-info-test.js'),

    hooks: {
        fixture: {
            before: async () => {
                flowInfoStorage.add('globalFixtureBefore');
            },
            after: async () => {
                flowInfoStorage.add('globalFixtureAfter');
            },
        },
        test: {
            before: async () => {
                flowInfoStorage.add('globalTestBefore');
            },
            after: async () => {
                flowInfoStorage.add('globalTestAfter');
            },
        },
        testRun: {
            before: async () => {
                flowInfoStorage.add('globalTestRunBefore');
            },
            after: async () => {
                flowInfoStorage.add('globalTestRunAfter');
                flowInfoStorage.save();
            },
        },
    },
    ...config.currentEnvironment,
    browsers: 'chrome:headless',
};
