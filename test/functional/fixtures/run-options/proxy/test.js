var config = require('../../../config');

describe('[API] Proxy', function () {
    it('Should send requests to a target server directly when the property is not specified', function () {
        return runTests('./testcafe-fixtures/proxy-test.js', 'Without proxy', { only: 'chrome' });
    });

    it('Should send requests to a proxy server when the property is specified', function () {
        return runTests('./testcafe-fixtures/proxy-test.js', 'With proxy', { only: 'chrome', proxyHost: 'localhost:' + config.site.port5 });
    });
});
