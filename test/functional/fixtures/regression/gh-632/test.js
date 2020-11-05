describe('[Regression](GH-632)', function () {
    it('Should not fail if window.self is overridden', function () {
        return runTests('./testcafe-fixtures/click-test.js', 'Click on body');
    });
});
