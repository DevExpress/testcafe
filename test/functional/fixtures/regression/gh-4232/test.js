describe('[Regression](GH-4232)', function () {
    it('Should not hang after submitting button in an iframe which redirects to a page on a different domain', function () { // eslint-disable-line
        return runTests(
            'testcafe-fixtures/index-test.js',
            'Click on submit button in an iframe when the click redirecting to a page on a different domain'
        );
    });
});
