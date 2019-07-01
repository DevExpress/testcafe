describe('[Regression](GH-3501) - Should focus label if it is bound to element and has tabIndex attribute', function () {
    it('Click label bound to radio', function () {
        return runTests('testcafe-fixtures/index.js', 'Label bound to radio is focused');
    });

    it('Click label bound to checkbox', function () {
        return runTests('testcafe-fixtures/index.js', 'Label bound to checkbox is focused');
    });
});


