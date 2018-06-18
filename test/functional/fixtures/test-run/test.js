describe('Code Evaluation', function () {
    it('Evaluate different types of code', function () {
        return runTests('testcafe-fixtures/evaluate-code.js', 'Evaluate');
    });

    it('Should return real queue lengh after all commands are added', function () {
        return runTests('testcafe-fixtures/get-real-queue-length.js', 'Test run commands queue');
    });
});
