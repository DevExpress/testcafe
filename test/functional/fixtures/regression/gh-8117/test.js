/* eslint-disable no-only-tests/no-only-tests */
const { onlyInNativeAutomation } = require('../../../utils/skip-in');
const path                       = require('path');
const createTestCafe             = require('../../../../../lib');
const { createReporter }         = require('../../../utils/reporter');
const { expect }                 = require('chai');

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
                .browsers(`chrome`)
                .reporter(reporter)
                .concurrency(concurrency)
                .run({ disableMultipleWindows: true });
        })
        .then(() => {
            testCafe.close();
        });
};

describe.only('[Regression](GH-8117)', function () {
    onlyInNativeAutomation('Should resize window in native automation mode with disableMultipleWindows option', function () {
        return run('testcafe-fixtures/resize.js')
            .then(() => expect(errors.length).eql(0));
    });
    onlyInNativeAutomation('Should resizeddd and maximize window in native automation mode with disableMultipleWindows option', function () {
        return run('testcafe-fixtures/maximize.js')
            .then(() => expect(errors.length).eql(0));
    });
});
