const getTimeLimitedPromise = require('time-limit-promise');

describe('[Regression](GH-3021) - Should not wait for selector timeout', function () {
    it('Should not wait for selector timeout', function () {
        const runTestsPromise = runTests('testcafe-fixtures/index.js', null, { selectorTimeout: 20000 });

        return getTimeLimitedPromise(runTestsPromise, 10000, { rejectWith: new Error('We should not wait for selector timeout in this test') });
    });
});

