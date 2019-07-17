const { expect } = require('chai');

describe('[Raw API] Code steps', function () {
    it('Selectors', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Selectors');
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
                    'An unhandled error "Assignment to constant variable." occurred in the custom JS code: ' +
                    'const q = 1; ' +
                    'q = 2; ' +
                    'at (2:3)'
                );
            });
    });
});
