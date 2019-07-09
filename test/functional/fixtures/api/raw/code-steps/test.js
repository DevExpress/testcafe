const { expect } = require('chai');

describe('[Raw API] Code steps', function () {
    it('Basic', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Basic');
    });

    it('Shared context', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Shared context');
    });

    it('Require', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Require');
    });

    it('Error', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Error', { shouldFail: true })
            .catch(err => {
                expect(err[0]).contains(
                    'An unhandled error "err is not defined" occurred in the code step: ' +
                    'const q = 1; ' +
                    'const u = err; ' +
                    'at (2:11)'
                );
            });
    });
});
