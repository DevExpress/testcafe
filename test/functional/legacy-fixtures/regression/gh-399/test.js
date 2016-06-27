it('[Regression](GH-399) Should resume the test if an iframe is removed after an action in it', function () {
    return runTests('testcafe-fixtures/index.test.js');
});
