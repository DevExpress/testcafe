/* eslint-disable no-only-tests/no-only-tests */
describe.only('[Regression](GH-7874)', function () {
    it('Should clear cookies between roles if page have not been changed', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
