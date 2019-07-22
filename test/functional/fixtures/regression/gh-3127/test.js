// NOTE: Right now, we can only download files in Chrome: https://github.com/DevExpress/testcafe/issues/2741
describe('[Regression](GH-3127) Should download files', function () {
    it('Basic test', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Download a file', { only: 'chrome' });
    });
});
