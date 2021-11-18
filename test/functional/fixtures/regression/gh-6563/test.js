describe('[Regression](GH-6563)', function () {
    it('Should pass correct "this" argument on the "beforeunload" event', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: 'chrome' });
    });
});


