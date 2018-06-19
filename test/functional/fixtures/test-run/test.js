describe('Code Evaluation', function () {
    it('Evaluate different types of code', function () {
        return runTests('testcafe-fixtures/evaluate-code.js', 'Evaluate');
    });
});

describe('Driver task queue', function () {
    it('Should return real queue length after all commands are added', function () {
        return runTests('testcafe-fixtures/get-real-queue-length.js', 'Check real driver task queue length');
    });
});
