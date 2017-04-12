describe('[Raw API] Wait action', function () {
    it('Should pass if the wait command is called before an action with an invisible element is performed and the timeout exceeds time required for the element to appear', function () {
        return runTests('testcafe-fixtures/wait.testcafe', 'Wait before click on element', { selectorTimeout: 0 });
    });
});
