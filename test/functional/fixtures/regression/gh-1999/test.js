// TODO: Need to fix https://github.com/DevExpress/testcafe/issues/4094
describe.skip('[Regression](GH-1999)', function () {
    it("Shouldn't raise an error if an iframe has html in src", function () {
        return runTests('testcafe-fixtures/index.js', null, { only: 'chrome' });
    });
});
