describe('[Regression](GH-7833)', function () {
    it('Should return correct title value', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
