describe('[Regression](GH-913)', function () {
    it("Shouldn't scroll to the focusable parent while performing click on non-focusable element", function () {
        return runTests('testcafe-fixtures/index-test.js', "Shouldn't scroll to target parent while performing click");
    });
});
