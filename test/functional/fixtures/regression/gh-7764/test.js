describe('[Regression](GH-7764)', function () {
    it('Request logger should contain actual headers if RequestHook modified them', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


