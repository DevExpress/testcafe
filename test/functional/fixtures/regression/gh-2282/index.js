describe('[Regression](GH-2282)', function () {
    it('Cookies should be restored correctly when User Roles with the preserveUrl option are used', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
