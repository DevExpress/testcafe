describe('[Regression](GH-2153)', function () {
    it('Shadow element should not appear in user event handler', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
