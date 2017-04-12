describe('[Regression](GH-608)', function () {
    it("Shouldn't wait for page unload if a link with javascript that doesn't lead to unload is clicked", function () {
        return runTests('testcafe-fixtures/index-test.js', 'click on a fake link');
    });
});
