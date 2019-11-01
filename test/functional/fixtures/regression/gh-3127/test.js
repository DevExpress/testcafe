describe('[Regression](GH-3127, GH-2741) Should download files', function () {
    it('JSON', function () {
        return runTests('testcafe-fixtures/index-test.js', 'JSON', { only: ['chrome', 'firefox'], skip: ['chrome-osx', 'firefox-osx'] });
    });

    it('Download ZIP', function () {
        return runTests('testcafe-fixtures/index-test.js', 'ZIP', { only: ['chrome', 'firefox'], skip: ['chrome-osx', 'firefox-osx'] });
    });

    it('Download PDF', function () {
        return runTests('testcafe-fixtures/index-test.js', 'PDF', { only: ['chrome', 'firefox'], skip: ['chrome-osx', 'firefox-osx'] });
    });
});
