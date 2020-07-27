describe('Disable page caching', () => {
    it('Test run', () => {
        return runTests('testcafe-fixtures/test-run.js', null, { disablePageCaching: true, disableMultipleWindows: true });
    });

    it('Fixture', () => {
        return runTests('testcafe-fixtures/fixture.js', null, { disableMultipleWindows: true });
    });

    it('Single test', () => {
        return runTests('testcafe-fixtures/single-test.js', null, { disableMultipleWindows: true });
    });
});
