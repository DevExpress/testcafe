var expect = require('chai').expect;


describe('[API] t.navigateTo', function () {
    it('Should navigate to the specified url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to another page');
    });

    it('Should validate the url argument', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Incorrect protocol', { shouldFail: 'true' })
            .catch(function (errs) {
                expect(errs[0]).contains('The url argument specifies a URL that uses an unsupported ftp:// protocol. Only HTTP and HTTPS are supported, as well as protocol-relative and relative URLs.');
                expect(errs[0]).contains('> 10 |    await t.navigateTo(\'ftp://localhost:3000/fixtures/api/es-next/navigate-to/pages/index.html\');');
            });
    });
});
