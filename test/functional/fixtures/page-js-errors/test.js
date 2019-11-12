const { errorInEachBrowserContains } = require('../../assertion-helper.js');
const { expect }                     = require('chai');

describe('Test should fail after js-error on the page', () => {
    it('if an error is raised before test done', () => {
        return runTests('./testcafe-fixtures/error-on-load-test.js', 'Empty test', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'The first error on page load', 0);
                errorInEachBrowserContains(errs, 'http://localhost:3000/fixtures/page-js-errors/pages/error-on-load.html', 0);
            });
    });

    it('if an error is raised before a command', () => {
        return runTests('./testcafe-fixtures/error-on-load-test.js', 'Click body', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'The first error on page load', 0);
            });
    });

    it('if an error is raised after a command', () => {
        return runTests('./testcafe-fixtures/error-after-click-test.js', 'Click button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'Error on click', 0);
            });
    });

    it('if an error is raised after a command after the page reloaded', () => {
        return runTests('./testcafe-fixtures/error-after-reload-test.js', 'Click button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'The first error on page load', 0);
            });
    });

    it('if an error is raised after a command before the page reloaded', () => {
        return runTests('./testcafe-fixtures/error-before-reload-test.js', 'Click button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'Error before reload', 0);
            });
    });

    it('if unhandled promise rejection is raised', () => {
        return runTests('./testcafe-fixtures/unhandled-promise-rejection-test.js', 'Click button',
            {
                shouldFail: true,
                only:       'chrome'
            })
            .catch(errs => {
                expect(errs[0]).contains('Rejection reason');
                expect(errs[0]).contains('No stack trace available');
            });
    });
});

describe('Should ignore an js-error on the page if the skipJsErrors option is set to true', () => {
    it('uncaught JavaScript error', () => {
        return runTests('./testcafe-fixtures/error-after-click-test.js', 'Click button', { skipJsErrors: true });
    });

    it ('unhandled Promise rejection', () => {
        return runTests('./testcafe-fixtures/unhandled-promise-rejection-test.js', 'Click button',
            {
                skipJsErrors: true,
                only:         'chrome'
            });
    });
});
