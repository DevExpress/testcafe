describe('[Regression](GH-2205)', function () {
    it('Should type in div if it has an invisible child with contententeditable=false', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
