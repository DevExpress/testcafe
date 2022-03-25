describe('Request', () => {
    it('Should execute GET request', function () {
        return runTests('testcafe-fixtures/test.js', 'Should execute simple request');
    });

    it('Should execute POST request', function () {
        return runTests('testcafe-fixtures/test.js', 'Should execute simple request');
    });
});
