describe('[Regression](GH-822) Should execute selectors with escapable symbols', function () {
    it('gh-822', function () {
        return runTests('testcafe-fixtures/index-test.js', '', { only: 'chrome' });
    });
});
