describe('[Regression](GH-2450)', function () {
    it('Should scroll to element which is hidden by fixed', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
