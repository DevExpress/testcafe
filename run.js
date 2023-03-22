const createTestCafe = require('./lib');

let _testcafe = null;
let _runner   = null;

createTestCafe()
    .then(testcafe => {
        _testcafe = testcafe;
        _runner   = testcafe.createRunner();

        return _runner
            .src('test.js')
            .browsers('chrome')
            .run({ disableNativeAutomation: true });
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);

        return _testcafe.close();
    })
    .catch(error => {
        console.log('Unexpected error: ' + error);

        process.exit(1);
    });
