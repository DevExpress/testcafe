describe('[Regression](GH-883) Test should not throw "Element is not visible" error', function () {
    it('gh-883', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-883');
    });
});
