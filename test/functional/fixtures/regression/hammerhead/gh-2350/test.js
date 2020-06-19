describe("Should provide a valid value for the 'document.title' property", () => {
    it('Initial value', () => {
        return runTests('./testcafe-fixtures/index.js', 'initial value');
    });

    it('Empty value', () => {
        return runTests('./testcafe-fixtures/index.js', 'empty value');
    });
});
