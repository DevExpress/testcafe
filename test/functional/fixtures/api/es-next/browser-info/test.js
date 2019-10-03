describe('[API] t.getBrowserInfo()', function () {
    it('Should return browser info', function () {
        return runTests('./testcafe-fixtures/browser-info-test.js', 't.getBrowserInfo');
    });
});
