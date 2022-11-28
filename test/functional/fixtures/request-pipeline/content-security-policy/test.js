describe('Content Security Policy', () => {
    it('Should disable CSP rules', () => {
        return runTests('testcafe-fixtures/csp.js', null, { only: 'chrome' });
    });
});
