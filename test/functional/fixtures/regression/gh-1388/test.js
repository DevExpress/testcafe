describe('[Regression](GH-1388)', function () {
    it('Should raise "input" event when selection is updated', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Press keys in a textarea');
    });
});
