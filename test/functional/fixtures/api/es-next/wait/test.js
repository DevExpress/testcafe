var expect = require('chai').expect;


describe('[API] Wait', function () {
    describe('t.wait', function () {
        it('Should wait for the specified time', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Wait', { only: 'chrome' });
        });

        it('Should validate the timeout argument', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Incorrect timeout argument (wait)', { only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The timeout argument is expected to be a positive integer, but it was NaN.');
                    expect(errs[0]).to.contains('> 19 |    await t.wait(NaN);');
                });
        });
    });

    describe('t.waitForElement', function () {
        it('Should wait for the specified element', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Wait for element');
        });

        it('Should validate the selector argument', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Incorrect selector argument', { only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The selector is expected to be a string, but it was object.');
                    expect(errs[0]).to.contains('> 23 |    await t.waitForElement(null, 2000);');
                });
        });

        it('Should validate the timeout argument', function () {
            return runTests('./testcafe-fixtures/wait-test.js', 'Incorrect timeout argument (waitForElement)', { only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('The timeout argument is expected to be a positive integer, but it was -1.');
                    expect(errs[0]).to.contains('> 27 |    await t.waitForElement(\'#timeout1\', -1);');
                });
        });
    });
});
