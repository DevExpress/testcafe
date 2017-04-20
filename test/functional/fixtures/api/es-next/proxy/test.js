var os = require('os');

const TRUSTED_PROXY_URL     = os.hostname() + ':3004';
const TRANSPARENT_PROXY_URL = os.hostname() + ':3005';

describe('[API] Using external proxy', function () {
    it('Should use proxy to open page', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { proxy: TRANSPARENT_PROXY_URL });
    });

    it('Should use anonym proxy to open restricted page', function () {
        return runTests('testcafe-fixtures/restricted-page.test.js', null, { proxy: TRUSTED_PROXY_URL });
    });
});
