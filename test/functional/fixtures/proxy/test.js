var os = require('os');

const TRUSTED_PROXY_URL     = os.hostname() + ':3004';
const TRANSPARENT_PROXY_URL = os.hostname() + ':3005';

describe('Using external proxy server', function () {
    it('Should open page via proxy server', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
    });

    it('Should open restricted page via trusted proxy server', function () {
        return runTests('testcafe-fixtures/restricted-page.test.js', null, { useProxy: TRUSTED_PROXY_URL });
    });
});
