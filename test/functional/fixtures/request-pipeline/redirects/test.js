describe('Redirects', () => {
    it('Should correctly handle redirects', () => {
        return runTests('testcafe-fixtures/redirects.js', null, { only: 'chrome' });
    });
});
