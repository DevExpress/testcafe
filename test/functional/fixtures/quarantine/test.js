const { expect }         = require('chai');
const config             = require('../../config');
const { createReporter } = require('../../utils/reporter');

const getFailureCount = results => {
    return Object.values(results).filter(value => value['passed'] === false);
};

const getPassCount = results => {
    return Object.values(results).filter(value => value['passed'] === true);
};

const getReporter = function (scope) {
    return createReporter({
        reportTestDone: (name, testRunInfo) => {
            scope.unstable    = testRunInfo.unstable;
            scope.failures    = getFailureCount(testRunInfo.quarantine).length;
            scope.passes      = getPassCount(testRunInfo.quarantine).length;
        },
        reportTestStart: (name, meta, { testRunIds }) => {
            scope.testRunIds = testRunIds;
        }
    });
};

if (config.useLocalBrowsers) {
    describe('Using quarantineMode', function () {
        it('Should attempt to run tests up to the failedThreshold amount (attemptLimit (10) - successThreshold (3 by default) + 1 = 8)', function () {
            const result   = {};
            const reporter = getReporter(result);

            return runTests('./testcafe-fixtures/test-quarantine-mode.js', 'Failing test, in quarantine mode', {
                quarantineMode: {
                    attemptLimit: 10
                },
                reporter: [reporter]
            })
                .then(function () {
                    expect(result.unstable).eql(false);
                    expect(result.failures).eql(8);
                });
        });

        it('Should pass the test if number of passes match successThreshold', function () {
            const result   = {};
            const reporter = getReporter(result);

            return runTests('./testcafe-fixtures/test-quarantine-mode.js', 'Check for unstable test', {
                quarantineMode: {
                    successThreshold: 2
                },
                reporter: [reporter]
            })
                .then(function () {
                    expect(result.unstable).eql(true);
                    expect(result.passes).eql(2);
                });
        });

        it('Should fail the test if number of failures match failureThreshold', function () {
            const result   = {};
            const reporter = getReporter(result);

            return runTests('./testcafe-fixtures/test-quarantine-mode.js', 'Another unstable test', {
                quarantineMode: {
                    attemptLimit: 10
                },
                reporter: [reporter]
            })
                .then(function () {
                    expect(result.unstable).eql(true);
                    expect(result.passes).eql(2);
                    expect(result.failures).eql(8);
                });
        });
    });
}
