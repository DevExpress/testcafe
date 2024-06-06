describe('[Regression](GH-8179)', function () {
    it('Should click on a two-word link split over two lines', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
