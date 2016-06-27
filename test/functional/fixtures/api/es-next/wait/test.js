var expect = require('chai').expect;


describe('[API] Wait', function () {
    describe('t.wait', function () {
        it('Should wait for the specified time', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Wait', { only: 'chrome' });
        });

        it('Should validate the timeout argument', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Incorrect timeout argument (wait)', { only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The "timeout" argument is expected to be a positive integer, but it was NaN.');
                    expect(errs[0]).to.contains('> 12 |    await t.wait(NaN);');
                });
        });
    });
});
