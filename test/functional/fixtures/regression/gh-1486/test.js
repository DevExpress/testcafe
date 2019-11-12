describe('[Regression](GH-1486)', function () {
    it('DoubleClick - Delay between clicks should not depend on action speed', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Double click with different speed', { only: 'chrome' });
    });
});
