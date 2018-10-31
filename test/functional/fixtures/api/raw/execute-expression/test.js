describe('[Raw API] Execute expression action', function () {
    // NOTE: Node 6 doesn't support async expressions
    it.skip('Should execute async expressions', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Execute an async expression');
    });

    it('Should execute simple sync expressions', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Execute a sync expression and save to a variable');
    });

    // NOTE: Node 6 doesn't support async expressions
    it.skip('Should share global variables between different command calls', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Share variables between commands');
    });

    // NOTE: Node 6 doesn't support async expressions
    it.skip('Should store an async property value to a variable', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Store an execution result to a variable');
    });
});
