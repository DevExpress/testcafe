describe('[Regression](GH-1311)', function () {
    it('Should raise "input" event while changing value in select input', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on select option (Non IE)', { skip: ['ie', 'ie 9', 'ie 10', 'edge'] });
    });

    it('Should not raise "input" event in IE while changing value in select input', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on select option (IE)', { only: ['ie', 'ie 9', 'ie 10', 'edge'] });
    });
});
