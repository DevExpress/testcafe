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

    it('Stack traces should not be filtered for paths that include a folder named "source-map-support"', function () {
        return runTests(
            'testcafe-fixtures/source-map-support/index.js',
            null,
            { shouldFail: true, only: 'chrome' }
        ).catch((err) => {
            expect(err.stack).match(/at .*index.js:1:7/);
        });
    });
});
