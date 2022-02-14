const expect                                                    = require('chai').expect;
const { SUCCESS_RESULT_ATTEMPTS, FAIL_RESULT_ATTEMPTS, ERRORS } = require('./constants');

const getCustomReporter = function (result) {
    return {
        name: function () {
            return {
                reportTestDone: function (name, { errs, quarantine, browsers }) {
                    if (quarantine)
                        Object.assign(result, { quarantine, browsers });

                    if (errs && errs.length > 0)
                        throw new Error(name);
                },
                reportFixtureStart: () => {
                },
                reportTaskStart: () => {
                },
                reportTaskDone: () => {

                },
            };
        },
        output: {
            write: () => {
            },
            end: () => {
            },
        },
    };
};

const expectAttempts = (attempts, { quarantine, browsers }) => {
    return browsers.reduce((prevBrowserExpectResult, browser) => {
        return attempts[browser.name].reduce((prevAttemptExpectResult, attempt, index) => {
            const testRunId = browser.quarantineAttemptsTestRunIds[index];

            if (attempt === ERRORS.None)
                return prevAttemptExpectResult && expect(quarantine[testRunId].passed).to.equal(true);

            return prevAttemptExpectResult &&
                expect(quarantine[testRunId].passed).to.equal(false) &&
                expect(quarantine[testRunId].errors[0].code).to.equal(attempt);
        }, true) && prevBrowserExpectResult;
    }, true);
};

describe('[Regression](GH-6722)', function () {
    it('Should success run with one success attempt', function () {
        const result   = {};
        const reporter = [getCustomReporter(result)];

        return runTests('testcafe-fixtures/index.js', 'Paste text on button click', {
            reporter,
            skipJsErrors:   false,
            quarantineMode: true,
        }).then(() => {
            expect(result.quarantine[1].passed).to.equal(true) &&
            expect(result.quarantine[2]).to.be.undefined;
        });
    });

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
