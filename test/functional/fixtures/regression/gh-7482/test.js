describe('[Regression](GH-7482)', () => {
    it("Shouldn't throw errors if test and fixtures methods are executed before test and fixtures", async () => {
        return runTests('./testcafe-fixtures/index.js', '', { only: ['chrome'] });
    });
});
