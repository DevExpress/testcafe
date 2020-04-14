describe('[Regression](GH-4516) - Should call the onResponse event for AJAX requests', function () {
    it('Should call the onResponse event for AJAX requests', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: 'chrome' });
    });
});
