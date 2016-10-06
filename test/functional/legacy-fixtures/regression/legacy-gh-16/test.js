describe('[Regression](GH-16)', function () {
    it('Should correctly store shared data in IE', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Check stored data', { only: 'ie' });
    });
});
