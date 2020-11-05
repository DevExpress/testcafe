describe('[Regression](GH-4793)', function () {
    it('Elements inside cross-domain iframes should be focusable', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Type text into an input inside a cross-domain iframe');
    });
});
