describe('[Regression](GH-8321)', function () {
    it('Should type text without errors when document selection is updated', function () {
        return runTests('testcafe-fixtures/index.js', 'Callsite Issue', { only: 'chrome' });
    });
});
