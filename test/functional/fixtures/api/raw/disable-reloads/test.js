describe('[API] .disableReloading/.enableReloading', () => {
    it('Shouldn\'t reload test pages when the fixture.disableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/fixture-disabled-reloads.testcafe');
    });

    it('Shouldn\'t reload test pages when the test.disableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/test-disabled-reloads.testcafe');
    });
});
