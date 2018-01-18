describe('[Regression](GH-2015)', function () {
    it('Should restore local storage correctly on UseRole with PreserveUrl', function () {
        return runTests('./testcafe-fixtures/index.js');
    });
});


