describe('[Regression](GH-770)', function () {
    it("Shouldn't focus on non-focusable element while clicking", function () {
        return runTests('./testcafe-fixtures/index.test.js', 'click non-focusable div');
    });
});
