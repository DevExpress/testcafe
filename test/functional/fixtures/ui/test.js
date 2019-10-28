describe('TestCafe UI', () => {
    it('Should display correct status', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
    });
    it('Should recalculate a view size with a status prefix', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Recalculate a view size with a status prefix');
    });
});
