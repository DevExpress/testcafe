const { expect } = require('chai');

describe('[Regression](GH-6205)', function () {
    it('Stack traces should not be filtered for paths that include a folder named "testcafe-hammerhead"', function () {
        return runTests(
            'testcafe-fixtures/testcafe-hammerhead/index.js',
            'Should throw an error',
            { shouldFail: true, only: 'chrome' }
        ).catch((errs) => {
            expect(errs[0]).match(/at .*index.js:4:11/);
        });
    });
});
