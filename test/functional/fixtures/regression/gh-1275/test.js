describe('[Regression](GH-1275)', function () {
    for (let i = 0; i < 1000; i++) {
        it.only(`test ${i}`, function () {
            return runTests('testcafe-fixtures/index-test.js', 'Hide input on blur', { only: ['ie'] });
        });
    }
});
