/*eslint-disable*/
const DEFAULT_SELECTOR_TIMEOUT   = 3000;
const DEFAULT_RUN_OPTIONS        = {
    selectorTimeout: DEFAULT_SELECTOR_TIMEOUT,
};

describe.only('[API] Fixture', function () {
    it('Should work import Fixture', function () {
        return runTests('./testcafe-fixtures/fixture-test.js', 'Fixture', DEFAULT_RUN_OPTIONS);
    });
});
