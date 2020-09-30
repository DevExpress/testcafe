describe("Should provide a valid value for the 'document.title' property", () => {
    it('Initial value', () => {
        return runTests('./testcafe-fixtures/index.js', 'initial value');
    });

    it('Initial value (script tag only in body)', () => {
        return runTests('./testcafe-fixtures/index.js', 'initial value (script tag only in body)');
    });

    it('Empty value', () => {
        return runTests('./testcafe-fixtures/index.js', 'empty value');
    });

    it('Change value', () => {
        return runTests('./testcafe-fixtures/index.js', 'change value');
    });

    it('Text property getters of the title element', () => {
        return runTests('./testcafe-fixtures/index.js', 'text property getters of the title element');
    });
});
