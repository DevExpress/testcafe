describe('[Regression](GH-1385)', function () {
    it('Should be able to get elements under cursor via "...fromPoint" functions', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Check "...fromPoint" functions');
    });
});
