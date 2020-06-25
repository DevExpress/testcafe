const createTestCafe = require('./lib');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338, void 0, true)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner
            .src('test.js')
            .browsers('chrome:emulation:device=iphone 6 --no-sandbox --auto-open-devtools-for-tabs')
            //.browsers('chrome --auto-open-devtools-for-tabs --disable-background-networking')
            //.browsers('chrome')
            //.browsers('firefox')
            //.browsers('firefox --devtools')
            //.browsers('ie')
            //.browsers('chrome:headless')
            //.browsers('edge')
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });
