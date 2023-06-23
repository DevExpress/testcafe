describe('[Regression](GH-7787)', function () {
    it('Should not fail if `statusCode` is set as string', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


