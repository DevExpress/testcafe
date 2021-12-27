describe('[Regression](GH-5616)', function () {
    it('Element "select" shouldn\'t be opened', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
