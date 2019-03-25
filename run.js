const createTestCafe = require('./lib');
let runner           = null;

createTestCafe('localhost', 1337, 1338, void 0, true)
    .then(testcafe => {
        runner = testcafe.createRunner();
    })
    .then(() => {
         return runner
            .src('test.js')
            .browsers('chrome')
            .run()
            .then(failedCount => {
                console.log(`Finished. Count failed tests:${failedCount}`);
                process.exit(failedCount)
            });
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
