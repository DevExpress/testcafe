const getTimeLimitedPromise = require('time-limit-promise');

describe('[Regression](GH-3021) - Should not wait for selector timeout if element has border-radius', function () {
    it('Should not wait for selector timeout', function () {
        const runTestsPromise = runTests('testcafe-fixtures/index.js', null, { selectorTimeout: 30000 });

        return getTimeLimitedPromise(runTestsPromise, 20000, { rejectWith: new Error('We should not wait for selector timeout in this test') });
    });
});

