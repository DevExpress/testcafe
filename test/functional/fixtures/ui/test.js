describe('TestCafe UI', () => {
    it('Status bar should display correct status', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
    });
    it('Status bar should recalculate view size with status prefix', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Recalculate view size with status prefix', { assertionTimeout: 3000 });
    });
});
