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
                flowInfoStorage.safeAdd('globalFixtureBefore');
            },
            after: async () => {
                flowInfoStorage.safeAdd('globalFixtureAfter');
            },
        },
        test: {
            before: async () => {
                flowInfoStorage.safeAdd('globalTestBefore');
            },
            after: async () => {
                flowInfoStorage.safeAdd('globalTestAfter');
            },
        },
        testRun: {
            before: async () => {
                flowInfoStorage.safeAdd('globalTestRunBefore');
            },
            after: async () => {
                flowInfoStorage.safeAdd('globalTestRunAfter');
            },
        },
    },
    ...config.currentEnvironment,
    browsers: 'chrome:headless',
};
