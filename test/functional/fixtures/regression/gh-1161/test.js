describe('[Regression](GH-1161)', function () {
    it('Test should not hang while top element dissapears during move automation', function () {
        return runTests('testcafe-fixtures/index.test.js', 'hover above floating element', { only: ['ie', 'ie 10'] });
    });
});
