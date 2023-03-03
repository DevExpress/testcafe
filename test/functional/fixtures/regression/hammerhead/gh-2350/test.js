describe("Should provide a valid value for the 'document.title' property", () => {
    describe('Initial value', () => {
        it('script before and after <title>', () => {
            return runTests('./testcafe-fixtures/index.js', 'script before and after <title>');
        });

        it('script tag only in <body>', () => {
            return runTests('./testcafe-fixtures/index.js', 'script tag only in <body>');
        });

        it('script tag only in <body> and <title> is not last in <head>', () => {
            return runTests('./testcafe-fixtures/index.js', 'script tag only in <body> and <title> is not last in <head>');
        });
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

    it('Set document.title in body', () => {
        return runTests('./testcafe-fixtures/index.js', 'set document.title in body');
    });

    it('Iframes', () => {
        return runTests('./testcafe-fixtures/iframes.js');
    });
});
