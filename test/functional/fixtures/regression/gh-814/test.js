describe('[Regression](GH-814) Should run tests if fixture name or test name contains new line symbols', function () {
    it('gh-814', function () {
        return runTests('testcafe-fixtures/index-test.js', '', { only: 'chrome' });
    });
});
