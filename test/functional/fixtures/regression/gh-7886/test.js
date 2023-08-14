describe("Should not raise an error on getting the input type='file' value (GH-7886)", function () {
    it("Should not raise an error on getting the input type='file' value (GH-7886)", function () {
        return runTests('testcafe-fixtures/index.test.js', null, { only: 'chrome' });
    });
});
