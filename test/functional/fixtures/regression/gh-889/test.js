describe('[Regression](GH-889)', function () {
    it('Should not call blur for table', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on children of table');
    });
});
