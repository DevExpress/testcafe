describe('TestCafe UI', () => {
    it('Status bar should display correct status', () => {
        return runTests('./testcafe-fixtures/status-bar-test.js', 'Show status prefix', { assertionTimeout: 3000 });
    });
});
