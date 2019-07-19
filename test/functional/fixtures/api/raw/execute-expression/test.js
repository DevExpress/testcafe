describe('[Raw API] Execute expression action', function () {
    it('Should execute async expressions', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Execute an async expression');
    });

    it('Should execute simple sync expressions', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Execute a sync expression and save to a variable');
    });

    it('Should share global variables between different command calls', function () {
        return runTests('./testcafe-fixtures/shared-context.testcafe', 'Share variables between commands');
    });
});
