describe('[Regression](GH-7874)', function () {
    it.skip('Should clear cookies between roles if page have not been changed', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
