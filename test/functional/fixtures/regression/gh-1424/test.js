describe('[Regression](GH-1424)', function () {
    it('Should raise click event on a button after "enter" key is pressed', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Press enter');
    });
});
