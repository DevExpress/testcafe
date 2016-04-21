var expect = require('chai').expect;


it('[Regression](T200501) Wait parameters are not verified', function () {
    return runTests('testcafe-fixtures/index.test.js', null, { shouldFail: true })
        .catch(function (errs) {
            var expectedError = [
                'Error at step "1.Wait with mixed up parameters":',
                ' act.wait(function () { return false; }, 500); ',
                'wait action\'s "milliseconds" parameter should be a positive number.'
            ].join(' ');

            expect(errs[0]).eql(expectedError);
        });
});
