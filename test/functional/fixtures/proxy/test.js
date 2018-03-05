var os = require('os');

const TRUSTED_PROXY_URL     = os.hostname() + ':3004';
const TRANSPARENT_PROXY_URL = os.hostname() + ':3005';
const ERROR_PROXY_URL       = 'ERROR';

describe('Using external proxy server', function () {
    it('Should open page via proxy server', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
    });

    it('Should open restricted page via trusted proxy server', function () {
        return runTests('testcafe-fixtures/restricted-page.test.js', null, { useProxy: TRUSTED_PROXY_URL });
    });
});

describe('Using proxy-bypass', function () {
    it('Should bypass using proxy by one rule', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: 'localhost:3000' });
    });

    it('Should bypass using proxy by set of rules', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: ERROR_PROXY_URL, proxyBypass: 'dummy,localhost:3000' });
    });

    it('Should use proxy and not fail on wrong proxy bypass type', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: TRANSPARENT_PROXY_URL, proxyBypass: 1 });
    });
});

