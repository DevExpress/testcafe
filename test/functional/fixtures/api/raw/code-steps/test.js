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
                    'An unhandled error occurred in the custom script:  Error details: Assignment to constant variable.  ' +
                    'const q = 1; q = 2; at 2:3'
                );
            });
    });

    it('Selector not found error', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Selector not found error', { shouldFail: true })
            .catch(err => {
                expect(err[0]).contains('The specified selector does not match any element in the DOM tree');
                expect(err[0]).contains('> | Selector(\'non-existing-selector\')');
            });
    });


    it('Errors on page', function () {
        return runTests('./testcafe-fixtures/code-steps.testcafe', 'Errors on page', { shouldFail: true })
            .catch(err => {
                const errs = [];

                if (Array.isArray(err))
                    errs.push(err[0]);
                else {
                    Object.values(err).forEach(e => {
                        errs.push(e[0]);
                    });
                }

                errs.forEach(e => {
                    expect(e).contains('A JavaScript error occurred');
                });
            });
    });
});
