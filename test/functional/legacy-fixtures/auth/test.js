describe('Basic and NTLM authentications', function () {
    it('Should not authenticate on a "basic" server with wrong credentials', function () {
        return runTests('./testcafe-fixtures/basic-auth-with-wrong-credentials.test.js');
    });

    it('Should authenticate on a "basic" server with correct credentials', function () {
        return runTests('./testcafe-fixtures/basic-auth-with-correct-credentials.test.js');
    });

    it('Should authenticate on a "NTLM" server with correct credentials', function () {
        return runTests('./testcafe-fixtures/ntlm-auth-check-username.test.js');
    });
});
