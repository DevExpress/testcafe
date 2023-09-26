const { expect }                 = require('chai');
const path                       = require('path');
const createTestCafe             = require('../../../../../lib');


let testCafe = null;
let runner   = null;

const run = (pathToTest, concurrency) => {
    const src = path.join(__dirname, pathToTest);


    return createTestCafe("localhost", 1337, 1338)
    .then(tc => {
        testCafe = tc;
    })
    .then(() => {
        runner = testCafe.createRunner();
        return runner
            .src(src)
            .browsers(['chrome'])
            .concurrency(concurrency)
            .run()
    });
}

describe('[Regression](GH-2011)', function() {
    it.only('Should execute all fixture\'s test with disable parallel in one browser', function () {
        return run('./testcafe-fixtures/concurrency-mode-with-no-concurrency-fixture-test.js', 2)
    })
})