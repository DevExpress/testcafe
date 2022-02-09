const expect                                                       = require('chai').expect;
const { EXCEPTION, SUCCESS_RESULT_ATTEMPTS, FAIL_RESULT_ATTEMPTS } = require('./constants');

const ERROR_CODES = {
    client: 'E1',
    server: 'E2',
};

const getCustomReporter = function (quarantine) {
    return {
        name: () => {
            return {
                reportTestDone: (name, testRunInfo) => {
                    if (testRunInfo.quarantine)
                        Object.assign(quarantine, testRunInfo.quarantine);

                    if (testRunInfo.errs)
                        testRunInfo.errs.forEach(err => this.write(err));
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

const expectAttempts = (attempts, quarantine) => {
    attempts.reduce((accumulator, attempt, index) => {
        if (attempt === EXCEPTION.None)
            return accumulator && expect(quarantine[index + 1].passed).to.equal(true);

        const errorCode = ERROR_CODES[attempt];

        return accumulator &&
            expect(quarantine[index + 1].passed).to.equal(false) &&
            expect(quarantine[index + 1].errors[0].code).to.equal(errorCode);
    }, true);
};

describe('[Regression](GH-6722)', function () {
    it('Should success run with one success attempt', function () {
        const quarantine = {};
        const reporter   = [getCustomReporter(quarantine)];

        return runTests('testcafe-fixtures/index.js', 'Paste text on button click', {
            reporter,
            skipJsErrors:   false,
            quarantineMode: true,
        }).then(() => {
            expect(quarantine[1].passed).to.equal(true) &&
            expect(quarantine[2]).to.be.undefined;
        });
    });

    it('Should success run with three success and two fail attempts', function () {
        const quarantine = {};
        const reporter   = [getCustomReporter(quarantine)];

        return runTests('./testcafe-fixtures/index.js', 'Throw exceptions on two attempts', {
            reporter,
            skipJsErrors:   false,
            quarantineMode: true,
        }).then(() => {
            expectAttempts(SUCCESS_RESULT_ATTEMPTS, quarantine);
        });
    });

    it('Should fail with two success and three fail attempts', function () {
        const quarantine = {};
        const reporter   = [getCustomReporter(quarantine)];

        return runTests('./testcafe-fixtures/index.js', 'Throw exceptions on three attempts', {
            quarantineMode: true,
            shouldFail:     true,
            skipJsErrors:   false,
            reporter,
        }).then(() => {
            throw Error('Test should fail');
        }).catch(() => {
            expectAttempts(FAIL_RESULT_ATTEMPTS, quarantine);
        });
    });

});
