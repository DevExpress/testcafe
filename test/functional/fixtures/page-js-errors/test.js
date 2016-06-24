var errorInEachBrowserContains = require('../../assertion-helper.js').errorInEachBrowserContains;


describe('Test should fail after js-error on the page', function () {
    it('if an error is raised before test done', function () {
        return runTests('./testcafe-fixtures/error-on-load-test.js', 'Empty test', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'The first error on page load', 0);
            });
    });

    it('if an error is raised before a command', function () {
        return runTests('./testcafe-fixtures/error-on-load-test.js', 'Click body', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'The first error on page load', 0);
            });
    });

    it('if an error is raised after a command', function () {
        return runTests('./testcafe-fixtures/error-after-click-test.js', 'Click button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Error on click', 0);
            });
    });

    it('if an error is raised after a command after the page reloaded', function () {
        return runTests('./testcafe-fixtures/error-after-reload-test.js', 'Click button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'The first error on page load', 0);
            });
    });

    it('if an error is raised after a command before the page reloaded', function () {
        return runTests('./testcafe-fixtures/error-before-reload-test.js', 'Click button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Error before reload', 0);
            });
    });
});
