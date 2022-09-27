describe('[API] Cookies', function () {
    it('Should get cookies by name', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by name');
    });

    it('Should get cookies by objects', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by objects');
    });

    it('Should set cookies by object with default url', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should set cookies by object with default url');
    });

    it('Should set cookies by key-value', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should set cookies by key-value');
    });

    it('Should set on the client', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should set on the client');
    });

    it('Should delete cookies by names and url', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by names and url');
    });

    it('Should delete cookies by objects', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by objects');
    });

    it('Should delete on the client', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete on the client');
    });
});
