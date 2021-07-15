const createTestCafe = require('./..');
let runner; let testcafe;

createTestCafe( 'localhost', '', '')
    .then(testcafeInstance => {
        runner = testcafeInstance.createRunner();
        testcafe = testcafeInstance;
    })
    .then(() => {
        return runner
            .src('./pseudo-test/fixture.ts')
            .browsers('chrome')
            .run({ debugMode: true });
    }).then(() => {
        testcafe.close();
    });
