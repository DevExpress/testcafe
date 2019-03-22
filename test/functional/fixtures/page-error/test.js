const expect = require('chai').expect;

describe('Handle page error', function () {
    it('Should fail if the error is not caught in the test', function () {
        return runTests('./testcafe-fixtures/page-error-test.js', 'Do not handle', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('A request to "http://some-unreachable.url" has failed. ' +
                    'Use quarantine mode to perform additional attempts to execute this test. ' +
                    'You can find troubleshooting information for this issue at ' +
                    '"https://go.devexpress.com/TestCafe_FAQ_ARequestHasFailed.aspx".');

                expect(errs[0]).contains('Failed to find a DNS-record for the resource at "http://some-unreachable.url"');
                expect(errs[0]).contains("> 5 |    await t.click('#unreachable-page-link');");
            });
    });
});
