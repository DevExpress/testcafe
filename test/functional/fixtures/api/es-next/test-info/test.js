describe.only('[API] Test Info', () => {
    it('Should pass correct test and fixture info to fixture hooks', () => {
        return runTests('./testcafe-fixtures/fixture-hooks.js', 'Fixture hooks')
    });
    it('Should pass correct test and fixture info to test hooks', () => {
        return runTests('./testcafe-fixtures/test-hooks.js', 'Test hooks')
    });
});
