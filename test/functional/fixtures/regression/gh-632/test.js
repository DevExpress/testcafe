describe('[Regression](GH-632)', function () {
    it('Should not fail if window.self is overriden', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click on body');
    });
});
