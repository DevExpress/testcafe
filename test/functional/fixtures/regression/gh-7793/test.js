describe('[Regression](GH-7793)', function () {
    it('Should set cookies with the `httpOnly` option', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


