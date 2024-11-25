describe('[Regression](GH-8321)', function () {
    it('Test should not fail with Uncaught object error on typeText', function () {
        return runTests('testcafe-fixtures/index.js', 'Callsite Issue', { only: 'chrome' });
    });
});
