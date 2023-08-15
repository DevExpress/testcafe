const config        = require('../../../../../config');
const path          = require('path');
const exportableLib = require('../../../../../../../lib/api/exportable-lib');

const { RequestLogger } = exportableLib;

const url    = 'http://localhost:3000/fixtures/api/es-next/global-hooks/pages/index.html';
const logger = new RequestLogger(url);

module.exports = {
    ...config.currentEnvironment,
    hostname:         config.testCafe.hostname,
    port1:            1335,
    port2:            1336,
    developmentMode:  config.devMode,
    retryTestPages:   config.retryTestPages,
    nativeAutomation: config.nativeAutomation,
    src:              path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/request-logger-test.js'),
    selectorTimeout:  200,
    assertionTimeout: 1000,
    pageLoadTimeout:  0,
    hooks:            {
        request: logger,
    },
    userVariables: {
        logger,
        url,
    },
    browsers: 'chrome:headless',
};
