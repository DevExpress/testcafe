describe('[Regression](GH-2282)', function () {
    // TODO: IMPORTANT: Azure test tasks hang when a role is used in a test, fix it immediately
    it('Cookies should be restored correctly when User Roles with the preserveUrl option are used', function () {
        return runTests('testcafe-fixtures/index.js', '', { skip: ['safari', 'chrome-osx', 'firefox-osx', 'ipad', 'iphone'] });
    });
});
