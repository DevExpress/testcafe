describe('[Regression](GH-2969) - Should handle beforeunload dialog on role initializing', function () {
    it('Handle beforeunload dialog', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
