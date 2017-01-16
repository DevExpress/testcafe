describe('[Regression](GH-1136)', function () {
    it('Test should not hang when target element width/height is fractional', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on element with negative offsets');
    });
});
