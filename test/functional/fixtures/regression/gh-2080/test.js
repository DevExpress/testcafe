describe('[Regression](GH-2080)', function () {
    it('Should find element with not-integer offset', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
