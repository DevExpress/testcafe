describe('[Regression](GH-664)', function () {
    it('Should not hang if page redirect was cancelled', function () {
        return runTests('testcafe-fixtures/index-test.js', '', { only: 'chrome' });
    });
});
