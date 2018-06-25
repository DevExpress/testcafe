describe('[API] .disableReloading/.enableReloading', () => {
    it('Should reload test pages by default', () => {
        return runTests('./testcafe-fixtures/default-test.js');
    });

    it('Shouldn\'t reload test pages when the Runner\'s disableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/globally-disabled-reloading-test.js', '', { noPageReload: true });
    });

    it('Shouldn\'t reload test pages when the fixture.disableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/fixture-disabled-reloading-test.js');
    });

    it('Shouldn\'t reload test pages when the test.disableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/test-disabled-reloading-test.js');
    });

    it('Should reload test pages when the fixture.enableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/fixture-enabled-reloading-test.js', '', { noPageReload: true });
    });

    it('Should reload test pages when the test.enableReloading option is specified', () => {
        return runTests('./testcafe-fixtures/test-enabled-reloading-test.js');
    });

    it('Shouldn\'t reload test pages when the fixture.enableReloading and the test.disableReloading options are specified', () => {
        return runTests('./testcafe-fixtures/fixture-enabled-test-disabled-reloading-test.js', '', { noPageReload: true });
    });
});
