var os = require('os');

const TRANSPARENT_PROXY_URL = os.hostname() + ':3005';

describe('Basic and NTLM authentications', function () {
    it('Should not authenticate on a "basic" server with wrong credentials', function () {
        return runTests('./testcafe-fixtures/basic-auth-with-wrong-credentials-test.js');
    });

    it('Should authenticate on a "basic" server with correct credentials', function () {
        return runTests('./testcafe-fixtures/basic-auth-with-correct-credentials-test.js');
    });

    it('Should authenticate on a "NTLM" server with correct credentials', function () {
        return runTests('./testcafe-fixtures/ntlm-auth-check-username-test.js');
    });

    it('Should override credentials with test.httpAuth', function () {
        return runTests('./testcafe-fixtures/override-credentials-test.js');
    });

    describe('Using external proxy server', function () {
        it('Should not authenticate on a "basic" server with wrong credentials', function () {
            return runTests('./testcafe-fixtures/basic-auth-with-wrong-credentials-test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
        });

        it('Should authenticate on a "basic" server with correct credentials', function () {
            return runTests('./testcafe-fixtures/basic-auth-with-correct-credentials-test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
        });

        it('Should authenticate on a "NTLM" server with correct credentials', function () {
            return runTests('./testcafe-fixtures/ntlm-auth-check-username-test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
        });

        it('Should override credentials with test.httpAuth', function () {
            return runTests('./testcafe-fixtures/override-credentials-test.js', null, { useProxy: TRANSPARENT_PROXY_URL });
        });
    });
});
