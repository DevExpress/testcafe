describe('[Regression](GH-2020)', function () {
    it('Should click on element with height/width of 1px', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
