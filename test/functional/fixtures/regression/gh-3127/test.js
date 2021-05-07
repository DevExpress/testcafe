describe('[Regression](GH-3127, GH-2741, GH-5892) Should download files', function () {
    it('JSON', function () {
        return runTests('testcafe-fixtures/index-test.js', 'JSON', { only: ['chrome', 'firefox'] });
    });

    it('Download ZIP', function () {
        return runTests('testcafe-fixtures/index-test.js', 'ZIP', { only: ['chrome', 'firefox'] });
    });

    it('Download PDF', function () {
        return runTests('testcafe-fixtures/index-test.js', 'PDF', { only: ['firefox', 'chrome'] });
    });

    it('Download XML', function () {
        return runTests('testcafe-fixtures/index-test.js', 'XML', { only: ['firefox', 'chrome'] });
    });
});
