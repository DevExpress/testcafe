describe('[Regression](GH-856) Test should not hang when redirect occurs after the page is loaded', function () {
    it('gh-856', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-856');
    });

    it('gh-856 (iframe)', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-856 (iframe)', { selectorTimeout: 10000 });
    });
});
