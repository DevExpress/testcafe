describe('[Regression](GH-8245)', function () {
    it('Should run test with static class blocks', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
