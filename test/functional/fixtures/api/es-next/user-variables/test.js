const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('[API] UserVariables', function () {
    it('Read', function () {
        return runTests('./testcafe-fixtures/readable-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
    it('Write', function () {
        return runTests('./testcafe-fixtures/writable-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
});
