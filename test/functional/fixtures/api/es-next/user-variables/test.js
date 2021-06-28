const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('[API] UserVariables', function () {
    it('Should provide user variables for read', function () {
        return runTests('./testcafe-fixtures/readable-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
    it('Should provide user variables for write', function () {
        return runTests('./testcafe-fixtures/writable-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
});
