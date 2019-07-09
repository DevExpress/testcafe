describe('Disable page caching', () => {
    it('Test run', () => {
        return runTests('testcafe-fixtures/test-run.js', null, { disablePageCaching: true });
    });

    it('Fixture', () => {
        return runTests('testcafe-fixtures/fixture.js');
    });

    it('Single test', () => {
        return runTests('testcafe-fixtures/single-test.js');
    });
});
