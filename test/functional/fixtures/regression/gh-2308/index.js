describe('[Regression](GH-2308)', function () {
    it('Use a location port for service urls', function () {
        return runTests('testcafe-fixtures/index.js', null, { selectorTimeout: 5000 });
    });
});
