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
                .run();
        })
        .then(() => {
            testCafe.close();
        });
};


describe('[Regression](GH-2011)', function () {

    it('Should execute all fixture\'s test with disableConcurrency in one browser', function () {
        return run('./testcafe-fixtures/concurrency-mode-with-disable-concurrency-fixture-test.js', 3)
            .then(() => expect(errors.length).eql(0));
    });

    it('Should execute all fixture\'s in different browser', function () {
        return run('./testcafe-fixtures/concurrency-mode-with-disable-concurrency-fixture-all-test.js', 3)
            .then(() => expect(errors.length).eql(0));
    });

    it('Should execute all fixture\'s test in one browser', function () {
        return run('./testcafe-fixtures/concurrency-mode-with-disable-concurrency-and-one-fixture-test.js', 3)
            .then(() => expect(errors.length).eql(0));
    });
});
