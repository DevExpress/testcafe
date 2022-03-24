const expect                                                    = require('chai').expect;
const { SUCCESS_RESULT_ATTEMPTS, FAIL_RESULT_ATTEMPTS, ERRORS } = require('./constants');
const config                                                    = require('../../../config');
const { createReporter }                                        = require('../../../utils/reporter');

const getCustomReporter = function (result) {
    return createReporter({
        reportTestDone: function (name, { errs, quarantine, browsers }) {
            if (quarantine)
                Object.assign(result, { quarantine, browsers });

            if (errs && errs.length > 0)
                throw new Error(errs[0]['message']);
        },
    });
};

const expectAttempts = (attempts, { quarantine, browsers }) => {
    const attemptsCount        = attempts.length;
    const successAttemptsCount = attempts.filter(attempt => attempt === ERRORS.None).length;
    const failedAttemptsCount  = attempts.filter(attempt => attempt !== ERRORS.None).length;
    const browsersCount        = browsers.length;

    const currentAttemptsCount        = Object.keys(quarantine).length;
    const currentSuccessAttemptsCount = Object.values(quarantine).filter(attempt => attempt.passed).length;
    const currentFailedAttemptsCount  = Object.values(quarantine).filter(attempt => !attempt.passed).length;
    const currentTestRunIdsCount      = browsers.reduce((counter, browser) => counter + browser.quarantineAttemptsTestRunIds.length, 0);

    // We have to add the number of attempts per browser as we also kept the old behavior. {1:{}, 2:{},  ... testRunId1:{}, testRunId2:{}, ...}
    const expectedAttemptsCount        = attemptsCount * (browsersCount + 1);
    const expectedSuccessAttemptsCount = successAttemptsCount * (browsersCount + 1);
    const expectedFailedAttemptsCount  = failedAttemptsCount * (browsersCount + 1);

    expect(currentAttemptsCount).to.equal(expectedAttemptsCount);
    expect(currentSuccessAttemptsCount).to.equal(expectedSuccessAttemptsCount);
    expect(currentFailedAttemptsCount).to.equal(expectedFailedAttemptsCount);
    expect(currentTestRunIdsCount).to.equal(attemptsCount * browsersCount);
};

// TODO: stabilize tests for Debug task
(config.experimentalDebug ? describe.skip : describe)('[Regression](GH-6722)', function () {
    it('Should success run with three success and two fail attempts', function () {
        const result   = {};
        const reporter = [getCustomReporter(result)];

        return runTests('./testcafe-fixtures/index.js', 'Throw exceptions on two attempts', {
            reporter,
            skipJsErrors:   false,
            quarantineMode: true,
        }).then(() => {
            expectAttempts(SUCCESS_RESULT_ATTEMPTS, result);
        }).catch((err)=>{
            throw new Error(err.message);
        });
    });

    it('Should fail with two success and three fail attempts', function () {
        const result            = {};
        const reporter          = [getCustomReporter(result)];
        const SHOULD_FAIL_ERROR = 'Test should fail';

        return runTests('./testcafe-fixtures/index.js', 'Throw exceptions on three attempts', {
            quarantineMode: true,
            shouldFail:     true,
            skipJsErrors:   false,
            reporter,
        }).then(() => {
            throw new Error(SHOULD_FAIL_ERROR);
        }).catch((err) => {
            if (err && err.message === SHOULD_FAIL_ERROR)
                throw new Error(SHOULD_FAIL_ERROR);

            expectAttempts(FAIL_RESULT_ATTEMPTS, result);
        });
    });

});
