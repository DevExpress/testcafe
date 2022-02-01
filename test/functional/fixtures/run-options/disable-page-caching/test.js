describe('Disable page caching', () => {
    it('Test run', () => {
        // NOTE: Temporary disable running on Safari
        return runTests('testcafe-fixtures/test-run.js', null, { disablePageCaching: true, disableMultipleWindows: true, skip: 'iphone,ipad,safari' });
    });

    it('Fixture', () => {
        // NOTE: Temporary disable running on Safari
        return runTests('testcafe-fixtures/fixture.js', null, { disableMultipleWindows: true, skip: 'iphone,ipad,safari' });
    });

    it('Single test', () => {
        // NOTE: Temporary disable running on Safari
        return runTests('testcafe-fixtures/single-test.js', null, { disableMultipleWindows: true, skip: 'iphone,ipad,safari' });
    });
});

