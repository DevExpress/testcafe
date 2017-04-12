describe('[Regression](GH-847) Move automation should not perform scrolling twice', function () {
    it('gh-847', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-847', { only: 'chrome' });
    });
});
