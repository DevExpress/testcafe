describe('[Regression](GH-754) Should run tests if fixture name or test name contains several singlequotes', function () {
    it('gh-754', function () {
        return runTests('testcafe-fixtures/index-test.js', '', { only: 'chrome' });
    });
});
