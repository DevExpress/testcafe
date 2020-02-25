const { expect } = require('chai');

describe('Allow multiple windows', () => {
    describe('Switch to the child window', () => {
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

        it('Cross domain', () => {
            return runTests('testcafe-fixtures/switching-to-child/cross-domain.js', null, { allowMultipleWindows: true });
        });
    });

    describe('Switch to the parent window', () => {
        it('"window.close" method call', () => {
            return runTests('testcafe-fixtures/switching-to-parent/window-close-call.js', null, { allowMultipleWindows: true });
        });
    });

    it('Console messages', () => {
        return runTests('testcafe-fixtures/console/console-test.js', null, { allowMultipleWindows: true });
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

    it('Close the window immediately after opening (GH-3762)', () => {
        return runTests('testcafe-fixtures/close-window-immediately-after-opeping.js', null, { allowMultipleWindows: true });
    });
});
