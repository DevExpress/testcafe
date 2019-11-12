describe('[Regression](GH-1240)', function () {
    it('Test should not raise an error when try to get a non-existent child', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Check a non-existent child', { only: ['chrome'] });
    });
});
