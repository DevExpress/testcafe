describe('[Regression](GH-4516) - Should call the onResponse event for AJAX requests', function () {
    it.only('Should call the onResponse event for AJAX requests', function () { // eslint-disable-line
        return runTests('testcafe-fixtures/index.js' );
    });
});
