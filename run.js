const createTestCafe = require('./lib');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338, void 0, true)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner
            .src('test.js')
            .browsers('chrome')
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });
