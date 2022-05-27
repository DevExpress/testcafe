describe('[Regression](GH-3495) - Visibility check should incorporate visibility of parent SVG element(s)', function () {
    it('Check visibility parent', function () {
        return runTests('testcafe-fixtures/index.js', "Parent shouldn't be visible");
    });
    it('Check visibility child', function () {
        return runTests('testcafe-fixtures/index.js', "Child shouldn't be visible");
    });
});


