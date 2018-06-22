describe('Code Evaluation', function () {
    it('Evaluate different types of code', function () {
        return runTests('testcafe-fixtures/evaluate-code.js', 'Evaluate');
    });
});

describe('Driver task queue', function () {
    it('Should return real queue length after all client commands are added', function () {
        return runTests('testcafe-fixtures/get-real-queue-length.js', 'Check real driver task queue length (client command)');
    });

    it('Should return real queue length after all server commands are added', function () {
        return runTests('testcafe-fixtures/get-real-queue-length.js', 'Check real driver task queue length (server command)');
    });
});
