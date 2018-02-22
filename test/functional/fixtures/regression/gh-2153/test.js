describe('[Regression](GH-2153)', function () {
    it("Shouldn't call document and window handlers extra times", function () {
        return runTests('testcafe-fixtures/index.js', null, { only: 'chrome,ie,firefox' });
    });
});
