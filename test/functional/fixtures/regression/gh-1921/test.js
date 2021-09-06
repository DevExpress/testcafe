describe('[Regression](GH-1921)', function () {
    it('Should switch to iframe loaded dynamically with form.submit', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


