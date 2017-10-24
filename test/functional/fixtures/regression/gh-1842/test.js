describe('[Regression](GH-1842)', function () {
    it('Should wait if an iframe reloads during the switchToIframe command execution', function () {
        return runTests('testcafe-fixtures/index-test.js', 'gh-1842', { selectorTimeout: 10000 });
    });

    it('Should take into account iframe selector\'s timeout option', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Individual timeout', { selectorTimeout: 200 });
    });
});
