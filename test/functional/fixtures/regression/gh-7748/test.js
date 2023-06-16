describe('[Regression](GH-7747)', function () {
    it('Should modify header on RequestHook', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


