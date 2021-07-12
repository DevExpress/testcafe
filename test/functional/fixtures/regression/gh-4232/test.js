describe('[Regression](GH-4232)', function () {
    it('Should not hang after submitting button in an iframe which redirects to a page on a different domain', function () {
        return runTests('testcafe-fixtures/index-test.js');
    });
});
