describe('[Regression](GH-1353)', function () {
    it('Document should be scrolled if body has "position: absolute"', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-1353');
    });
});
