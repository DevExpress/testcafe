describe('[Regression](GH-1846)', function () {
    it('Should be able to click on an element under the TestCafe panel', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Click element under the panel');
    });
});
