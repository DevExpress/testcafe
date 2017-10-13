describe('[Regression](GH-1874)', function () {
    it('Should not throw an error when RequireJS module was loaded', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-1874');
    });
});
