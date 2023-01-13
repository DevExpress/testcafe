const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('Test structure', function () {
    it('Should work import "test"', function () {
        return runTests('./testcafe-fixtures/imported-fixture-test.js', '', DEFAULT_RUN_OPTIONS);
    });

    it('Should work import "fixture"', function () {
        return runTests('./testcafe-fixtures/imported-test-test.js', '', DEFAULT_RUN_OPTIONS);
    });

    it('Should work attached tests', function () {
        return runTests('./testcafe-fixtures/test-structure-test.js', 'Attached tests should work', DEFAULT_RUN_OPTIONS);
    });
});

