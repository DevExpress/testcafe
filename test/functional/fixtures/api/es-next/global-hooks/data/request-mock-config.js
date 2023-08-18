const config          = require('../../../../../config');
const path            = require('path');
const exportableLib   = require('../../../../../../../lib/api/exportable-lib');
const { RequestMock } = exportableLib;

const requestMock = RequestMock()
    .onRequestTo('http://dummy-url.com')
    .respond('http://localhost:3000/fixtures/api/es-next/global-hooks/pages/mock-page.html')
    .onRequestTo('http://dummy-url.com/get')
    .respond('Data from mocked fetch request')
    .onRequestTo('https://another-dummy-url.com')
    .respond();

module.exports = {
    ...config.currentEnvironment,
    hostname:         config.testCafe.hostname,
    port1:            1335,
    port2:            1336,
    developmentMode:  config.devMode,
    retryTestPages:   config.retryTestPages,
    nativeAutomation: config.nativeAutomation,
    src:              path.resolve('./test/functional/fixtures/api/es-next/global-hooks/testcafe-fixtures/request-mock-test.js'),
    selectorTimeout:  200,
    assertionTimeout: 1000,
    pageLoadTimeout:  0,
    hooks:            {
        request: requestMock,
    },
    browsers: 'chrome:headless',
};
