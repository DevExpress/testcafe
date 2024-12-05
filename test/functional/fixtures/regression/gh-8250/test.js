describe('[Regression](GH-8250)', function () {
    it('Click should not be called after dragToElement', function () {
        return runTests('testcafe-fixtures/index.js', 'Click should not be called', { only: 'chrome' });
    });
});
