describe('[Regression](GH-8264)', function () {
    it('Test should not fails with Uncaught object error on leaveElement when the prevElement is removed from the DOM', function () {
        return runTests('testcafe-fixtures/index.js', 'Callsite Issue', { only: 'chrome' });
    });
});
