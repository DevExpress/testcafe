describe('[API] Cookies', function () {
    it('Should get all cookies', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get all cookies');
    });
    it('Should get cookies by name', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by name');
    });
    it('Should get cookies by names', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by names');
    });
    it('Should get cookies by name and url', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by name and url');
    });
    it('Should get cookies by names and url', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by names and url');
    });
    it('Should get cookies by name and urls', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by name and urls');
    });
    it('Should get cookies by names and urls', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by names and urls');
    });
    it('Should get cookies by object with domain', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by object with domain and path');
    });
    it('Should get cookies by objects', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies by objects');
    });

    it('Should set cookies (t.setCookies)', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should set cookies (t.setCookies)');
    });

    it('Should delete all cookies', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete all cookies');
    });
    it('Should delete cookies by name', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by name');
    });
    it('Should delete cookies by names', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by names');
    });
    it('Should delete cookies by name and url', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by name and url');
    });
    it('Should delete cookies by names and url', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by names and url');
    });
    it('Should delete cookies by name and urls', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by name and urls');
    });
    it('Should delete cookies by names and urls', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by names and urls');
    });
    it('Should delete cookies by object with domain', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by object with domain and path');
    });
    it('Should delete cookies by objects', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies by objects');
    });
});
