describe('[API] t.browser', function () { // eslint-disable-line no-only-tests/no-only-tests
    it('Should return browser information', function () {
        return runTests('./testcafe-fixtures/browser-info-test.js', 't.browser');
    });
});
