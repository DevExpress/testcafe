const path           = require('path');
const createTestCafe = require('../../../../../lib');

let testCafe = null;
let runner   = null;

const run = (pathToTest, concurrency) => {
    const src = path.join(__dirname, pathToTest);

    return createTestCafe('127.0.0.1', 1335, 1336)
        .then(tc => {
            testCafe = tc;
        })
        .then(() => {
            runner = testCafe.createRunner();
            return runner
                .src(src)
                .browsers(`chrome:headless`)
                .concurrency(concurrency)
                .run();
        })
        .then(() => {
            testCafe.close();
        });
};

describe('[Regression](GH-2011)', function () {

    it('Should execute all fixture\'s test with noConcurrency in one browser', function () {
        return run('./testcafe-fixtures/concurrency-mode-with-no-concurrency-fixture-test.js', 3);
    });

    it('Should execute all fixture\'s in different browser', function () {
        return run('./testcafe-fixtures/concurrency-mode-with-no-concurrency-fixture-all-test.js', 3);
    });
});
