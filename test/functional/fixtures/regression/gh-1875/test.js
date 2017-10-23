describe.only('[Regression](GH-1875)', function () {
    it('Should listen console messages in iframes before it loaded completely', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-1875');
    });
});
