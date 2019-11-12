describe('[Regression](GH-743)', function () {
    it('Should not start the next test if the previous one is not finished', function () {
        return runTests('testcafe-fixtures/two-tests-in-a-fixture.js', '', { only: 'chrome' });
    });
});
