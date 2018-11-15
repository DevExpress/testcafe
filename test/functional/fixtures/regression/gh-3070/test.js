describe('[Regression](GH-3070) - Should not hang after \'wait\' command', function () {
    it('Wait for 15 seconds', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


