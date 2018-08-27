describe('[Regression](GH-2080)', function () {
    it('click', function () {
        return runTests('testcafe-fixtures/index.js', 'click');
    });

    it('drag', function () {
        return runTests('testcafe-fixtures/index.js', 'drag', { skip: 'ie' });
    });

    it('hover', function () {
        return runTests('testcafe-fixtures/index.js', 'hover', { skip: 'ie' });
    });
});
