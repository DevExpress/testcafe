describe('[API] t.browser', function () {
    it('Should return browser information', function () {
        return runTests('./testcafe-fixtures/browser-info-test.js', 't.browser', { only: 'headlesschrome' });
    });
});
