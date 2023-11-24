const path               = require('path');
const createTestCafe     = require('../../../../../lib');
const { createReporter } = require('../../../utils/reporter');
const { expect }         = require('chai');

let testCafe = null;
let runner   = null;
let errors   = null;

const reporter = createReporter({
    reportTestDone (_, testRunInfo) {
        errors = testRunInfo.errs;
    },
});


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
                .reporter(reporter)
                .concurrency(concurrency)
                .run({ quarantineMode: { successThreshold: 1, attemptLimit: 3 } });
        })
        .then(() => {
            testCafe.close();
        });
};

describe('[Regression](GH-8087)', function () {
    it('Should execute all fixture\'s test in one browser with quarantine Mode', function () {
        return run('./testcafe-fixtures/index.js', 2)
            .then(() => expect(errors.length).eql(0));
    });
});
