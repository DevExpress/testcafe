/* eslint-disable no-only-tests/no-only-tests */
describe('Worker header', function () {
    it.only('Should not break due to undefined optional chaining', function () {
        return runTests('testcafe-fixtures/index.js', null);
    });
});
