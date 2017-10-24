describe('[Regression](GH-1875)', function () {
    it('Should listen console messages in an iframe before it is loaded completely', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-1875', { selectorTimeout: 10000 });
    });
});
