var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] Generic errors', function () {
    describe('Error in test code', function () {
        it('Should handle unsupported protocol in a test page', function () {
            return runTests('./testcafe-fixtures/unsupported-protocol-test.js', 'Test',
                { shouldFail: true, only: 'chrome' })
                .catch(function (err) {
                    expect(err.message).contains('The specified "mail://testcafe@devexpress.io" test page URL uses an unsupported mail:// protocol.');
                });
        });

        it('Should handle error thrown by test code', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Test code throws Error',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('Error: Yo!');
                    expect(errs[0]).to.contains('>  8 |    throw new Error(\'Yo!\')');
                });
        });

        it('Should handle non-Error object thrown by test code', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Test code throws non-Error object',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('Uncaught number "42" was thrown. Throw Error instead.');
                });
        });

        it('Should handle null thrown by test code', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Test code throws null',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('Uncaught object "null" was thrown. Throw Error instead.');
                });
        });

        it('Should handle error thrown by helper code', function () {
            return runTests('./testcafe-fixtures/error-in-test-code-test.js', 'Helper code throws Error',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('Error: yo!');
                    expect(errs[0]).to.contains('> 4 |    throw new Error(\'yo!\');');
                });
        });
    });

    describe('External assertion library error', function () {
        it('Should handle Node built-in assertion lib error', function () {
            return runTests('./testcafe-fixtures/external-assertion-lib-errors-test.js', 'Built-in assertion lib error',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('> 13 |    assert.strictEqual(\'answer\', \'42\');');
                    expect(errs[0]).to.match(/AssertionError( \[ERR_ASSERTION])?: 'answer' === '42'/);
                });
        });

        it('Should handle Chai assertion error', function () {
            return runTests('./testcafe-fixtures/external-assertion-lib-errors-test.js', 'Chai assertion error',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('> 17 |    expect(\'answer\').eql(\'42\');');
                    expect(errs[0]).to.contains("AssertionError: expected 'answer' to deeply equal '42'");
                });
        });

        it('Should handle assertion errors in helper code', function () {
            return runTests('./testcafe-fixtures/external-assertion-lib-errors-test.js', 'Assertion error in helper',
                { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).to.contains('>  8 |    assert(false);');
                    expect(errs[0]).to.match(/AssertionError( \[ERR_ASSERTION])?: false == true/);
                });
        });
    });
});
