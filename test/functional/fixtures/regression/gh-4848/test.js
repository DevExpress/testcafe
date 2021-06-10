describe('[Regression](GH-4848) - Should focus next element if current element has negative tabIndex', function () {
    it('Straight order. Middle', function () {
        return runTests('testcafe-fixtures/index.js', 'Straight order. Middle');
    });

    it('Reversed order. Middle', function () {
        return runTests('testcafe-fixtures/index.js', 'Reversed order. Middle');
    });

    it('Reversed order. First', function () {
        return runTests('testcafe-fixtures/index.js', 'Reversed order. First');
    });

    it('Reversed order. Last', function () {
        return runTests('testcafe-fixtures/index.js', 'Reversed order. Last');
    });

    it('Straight order. First', function () {
        return runTests('testcafe-fixtures/index.js', 'Straight order. First');
    });

    it('Straight order. Last', function () {
        return runTests('testcafe-fixtures/index.js', 'Straight order. Last');
    });
});
