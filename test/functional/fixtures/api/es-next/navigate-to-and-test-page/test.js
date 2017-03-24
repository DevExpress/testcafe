var expect = require('chai').expect;


describe('[API] t.navigateTo', function () {
    it('Should validate the url argument', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Incorrect protocol', { shouldFail: 'true' })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified "ftp://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/index.html" test page URL uses an unsupported ftp:// protocol. Only relative URLs or absolute URLs with http://, https:// and file:// protocols are supported.');
                expect(errs[0]).contains('> 72 |    await t.navigateTo(\'ftp://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/index.html\');');
            });
    });

    it('Should navigate to an absolute http url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to absolute http page');
    });

    it('Should navigate to a relative http url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to relative http page');
    });

    it('Should navigate to a scheme-less http url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to scheme-less http page', { only: 'chrome' });
    });

    it('Should navigate to a relative file url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to relative file page', { only: 'chrome' });
    });

    it('Should navigate to an absolute file url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to absolute file page', { only: 'chrome' });
    });

    it('Should navigate to a scheme-less file url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to scheme-less file page', { only: 'chrome' });
    });

    it('Should navigate to an absolute file url with scheme', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to absolute file page with scheme', { only: 'chrome' });
    });

    it('Should navigate to about:blank', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Navigate to about:blank', { only: 'chrome' });
    });
});

describe('[API] test.page', function () {
    it('Should navigate to an absolute http url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Absolute http page', { only: 'chrome' });
    });

    it('Should navigate to a relative file url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Relative file page', { only: 'chrome' });
    });

    it('Should navigate to an absolute file url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Absolute file page', { only: 'chrome' });
    });

    it('Should navigate to a scheme-less http url', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Scheme-less http page 1', { only: 'chrome' });
    });

    it('Should navigate to a scheme-less http url with double slashes', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Scheme-less http page 2', { only: 'chrome' });
    });

    it('Should navigate to an absolute file url with scheme', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'Absolute file page with scheme', { only: 'chrome' });
    });

    it('Should navigate to about:blank', function () {
        return runTests('./testcafe-fixtures/navigate-to-test.js', 'about:blank', { only: 'chrome' });
    });
});
