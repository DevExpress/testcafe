var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] Generic errors', function () {
    describe('Error in test code', function () {
        it('Should handle error thrown by test code [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Test code throws Error', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains('Error: Yo!');
                    expect(err).to.contains('>  8 |    throw new Error(\'Yo!\')');
                });
        });

        it('Should handle non-Error object thrown by test code [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Test code throws non-Error object', { shouldFail: true })
                .catch(function (err) {
                    expect(err).eql('Uncaught number "42" was thrown. Throw Error instead.');
                });
        });

        it('Should handle null thrown by test code [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Test code throws null', { shouldFail: true })
                .catch(function (err) {
                    expect(err).eql('Uncaught object "null" was thrown. Throw Error instead.');
                });
        });

        it('Should handle error thrown by helper code [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Helper code throws Error', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains('Error: yo!');
                    expect(err).to.contains('> 2 |    throw new Error(\'yo!\');');
                });
        });
    });

    describe('External assertion library error', function () {
        it('Should handle Node built-in assertion lib error [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/external-assertion-lib-errors-test.js', 'Built-in assertion lib error', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains("AssertionError: 'answer' === '42'");
                });
        });

        it('Should handle Chai assertion error [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/external-assertion-lib-errors-test.js', 'Chai assertion error', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains("AssertionError: expected 'answer' to deeply equal '42'");
                });
        });

        it('Should handle assertion errors in helper code [ONLY:chrome]', function () {
            return runTests('./testcafe-fixtures/external-assertion-lib-errors-test.js', 'Assertion error in helper', { shouldFail: true })
                .catch(function (err) {
                    expect(err).to.contains('AssertionError: false == true');
                });
        });
    });
});
