describe.only('[Regression](GH-7667)', function () {
    it('Should select and remove text from input', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
