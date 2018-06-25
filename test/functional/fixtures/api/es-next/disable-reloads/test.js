describe('[API] .disableReloading/.enableReloading', () => {
    it('Should reload test pages by default', () => {
        return runTests('./testcafe-fixtures/default-test.js');
    });

    it('Shouldn\'t reload test pages when the Runner\'s disablePageReloads option is specified', () => {
        return runTests('./testcafe-fixtures/globally-disabled-reloads-test.js', '', { disablePageReloads: true });
    });

    it('Shouldn\'t reload test pages when the fixture.disablePageReloads option is specified', () => {
        return runTests('./testcafe-fixtures/fixture-disabled-reloads-test.js');
    });

    it('Shouldn\'t reload test pages when the test.disablePageReloads option is specified', () => {
        return runTests('./testcafe-fixtures/test-disabled-reloads-test.js');
    });

    it('Should reload test pages when the fixture.enablePageReloads option is specified', () => {
        return runTests('./testcafe-fixtures/fixture-enabled-reloads-test.js', '', { disablePageReloads: true });
    });

    it('Should reload test pages when the test.enablePageReloads option is specified', () => {
        return runTests('./testcafe-fixtures/test-enabled-reloads-test.js');
    });

    it('Shouldn\'t reload test pages when the fixture.enablePageReloads and the test.disablePageReloads options are specified', () => {
        return runTests('./testcafe-fixtures/fixture-enabled-test-disabled-reloads-test.js', '', { disablePageReloads: true });
    });
});
