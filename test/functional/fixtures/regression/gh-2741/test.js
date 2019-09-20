describe('[Regression](GH-2741) Should download files in FF', function () {
    it('Download ZIP', function () {
        return runTests('testcafe-fixtures/index-test.js', 'ZIP', { only: 'firefox' });
    });

    it('Download PDF', function () {
        return runTests('testcafe-fixtures/index-test.js', 'PDF', { only: 'firefox' });
    });
});
