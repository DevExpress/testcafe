const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('[API] UserVariables', function () {
    it('Should provide user variables', function () {
        return runTests('./testcafe-fixtures/user-variables-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
});
