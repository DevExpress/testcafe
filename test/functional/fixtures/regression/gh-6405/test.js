describe('[Regression](GH-6405)', function () {
    it('Should not throw error on `tab` action when cross-domain iframe presents on page', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


