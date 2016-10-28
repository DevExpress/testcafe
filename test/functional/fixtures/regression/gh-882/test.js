describe.only('[Regression](GH-882) Test should not hang with content scaling or in Hi-DPI mode', function () {
    // NOTE: Test must be runned on zoomed page or in Hi-DPI mode
    it('gh-882', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-882');
    });
});
