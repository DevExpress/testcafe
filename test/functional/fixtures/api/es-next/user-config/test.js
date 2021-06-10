const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe('[API] UserConfig', function () {
    it('Should provide user config', function () {
        return runTests('./testcafe-fixtures/user-config-test.js', 'test', DEFAULT_RUN_OPTIONS);
    });
});
