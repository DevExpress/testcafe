const Promise = require('pinkie');

describe('[Regression](GH-3021) - Should not wait for selector timeout', function () {
    it('Should not wait for selector timeout', function () {
        let isTimeoutExceeded = false;
        let timeout           = null;

        const runTestsPromise = runTests('testcafe-fixtures/index.js', null, { selectorTimeout: 20000 });

        const timeoutPromise = new Promise(resolve => {
            timeout = setTimeout(() => {
                isTimeoutExceeded = true;

                resolve();
            }, 10000);
        });

        return Promise.race([runTestsPromise, timeoutPromise]).then(() => {
            if (isTimeoutExceeded)
                throw new Error('We should not wait for selector timeout in this test');
            else
                clearTimeout(timeout);
        });
    });
});
