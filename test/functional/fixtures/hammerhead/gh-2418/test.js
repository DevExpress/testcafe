describe('Should not break the childNodes order', () => {
    it('Should not break the childNodes order', () => {
        return runTests('testcafe-fixtures/index.js', null, { only: 'chrome' });
    });
});
