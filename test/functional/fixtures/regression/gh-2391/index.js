describe('[Regression](GH-2391)', function () {
    it('should scroll to element if it is hidden by fixed', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
