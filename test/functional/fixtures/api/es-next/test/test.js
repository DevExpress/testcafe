const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('[API] Test', function () {
    it('Should work import Test', function () {
        return runTests('./testcafe-fixtures/test-test.js', 'Test', DEFAULT_RUN_OPTIONS);
    });
});
