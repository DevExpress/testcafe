describe('[Regression](GH-4222) - Should scroll to element that is inside a template/slot', function () {
    it('Should scroll to element that is inside a template/slot', function () {
        return runTests('testcafe-fixtures/index.js', null, { skip: 'ie' });
    });
});


