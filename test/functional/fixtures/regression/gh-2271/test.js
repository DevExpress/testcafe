describe('[Regression](GH-2271)', function () {
    // NOTE: The relatedTarget property in drag events is only supported in Chrome
    it('Drag events should contain relatedTarget property', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: ['chrome'] });
    });
});
