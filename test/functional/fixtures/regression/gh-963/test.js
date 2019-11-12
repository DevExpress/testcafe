describe('[Regression](GH-963)', function () {
    it('Should be possible to call setFilesToUpload and clearUpload for a hidden input', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Call setFilesToUpload and clearUpload for a hidden input', {
            only: 'chrome'
        });
    });
});
