describe('[Regression](GH-1138)', function () {
    it('Test should click on target that has moved during the action', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on element bound to the right bottom corner');
    });
});
