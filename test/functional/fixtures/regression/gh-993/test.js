describe('[Regression](GH-993)', function () {
    it('t.pressKey should work properly on Angular2 page', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Perform t.pressKey on input');
    });
});
