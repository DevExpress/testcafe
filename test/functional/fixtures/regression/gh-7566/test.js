describe('[Regression](GH-7566)', function () {
    it('Should has the "which" property equal to "0" for move events', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


