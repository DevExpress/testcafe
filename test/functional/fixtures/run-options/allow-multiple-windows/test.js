const { expect } = require('chai');

describe('Allow multiple windows', () => {
    describe('Switch to the opened window', () => {
        it('Click on link', () => {
            return runTests('testcafe-fixtures/switching-to-child/click-on-link.js', null, { allowMultipleWindows: true });
        });

        it('Form submit', () => {
            return runTests('testcafe-fixtures/switching-to-child/form-submit.js', null, { allowMultipleWindows: true });
        });

        it('window.open', () => {
            return runTests('testcafe-fixtures/switching-to-child/call-window-open.js', null, { allowMultipleWindows: true });
        });

        it('Nested pages', () => {
            return runTests('testcafe-fixtures/switching-to-child/nested-pages.js', null, { allowMultipleWindows: true });
        });
    });

    // TODO: Work in progress
    it.skip('Switching to the parent window after the "window.close" method call', () => {
        return runTests('testcafe-fixtures/switching-to-parent/window-close-call.js', null, { allowMultipleWindows: true });
    });

    it('Unhandled JavaScript errors', () => {
        return runTests('testcafe-fixtures/handle-errors/handle-js-errors.js', null, {
            allowMultipleWindows: true,
            shouldFail:           true
        })
            .catch(errs => {
                expect(errs[0]).to.contain('A JavaScript error occurred on "http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/handle-errors/page-with-js-error.html"');
            });
    });
});
