it('Should resume the test if an iframe is removed after an action in it (GH-399)', function () {
    return runTests('testcafe-fixtures/index.test.js');
});
