describe('[API] Cookies', function () {
    it('Should get cookies (t.getCookies)', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies (t.getCookies)');
    });

    it('Should set cookies (t.setCookies)', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should set cookies (t.setCookies)');
    });

    it('Should delete cookies (t.deleteCookies)', function () {
        return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies (t.deleteCookies)');
    });
});
