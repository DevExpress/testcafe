const { expect }     = require('chai');
const createTestCafe = require('../../../../../lib');
const path           = require('path');

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

    describe('Cookie synchonization', () => {
        it('cross-domain', () => {
            return runTests('testcafe-fixtures/cookie-synchronization/cross-domain.js', null, { allowMultipleWindows: true });
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

    it('headless', () => {
        return createTestCafe('127.0.0.1', 1335, 1336)
            .then(tc => {
                testCafe = tc;
            })
            .then(() => {
                const fullTestPath = path.join(__dirname, './testcafe-fixtures/headless.js');

                return testCafe.createRunner()
                    .browsers(`chrome:headless`)
                    .src(fullTestPath)
                    .run({ allowMultipleWindows: true });
            })
            .then(() => {
                return testCafe.close();
            });
    });

    describe('Should not finalize some commands on driver starting (GH-4855)', () => {
        it('ExecuteSelectorCommand', () => {
            return runTests('testcafe-fixtures/i4855.js', 'ExecuteSelectorCommand', { allowMultipleWindows: true });
        });

        it('ExecuteClientFunctionCommand', () => {
            return runTests('testcafe-fixtures/i4855.js', 'ExecuteClientFunctionCommand', { allowMultipleWindows: true });
        });
    });

    it('Should correctly synchronize a cookie from a new same-domain window', () => {
        return runTests('testcafe-fixtures/cookie-synchronization/same-domain.js', null, { allowMultipleWindows: true });
    });

    it('Should continue debugging when a child window closes', () => {
        return runTests('testcafe-fixtures/debug-synchronization.js', null, { only: 'chrome', allowMultipleWindows: true });
    });

    describe('API', () => {
        it('Open child window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Open child window', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Close current window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close current window', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Get current window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Get current window', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Switch to parent window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to parent window', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Switch to unexisting window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to unexisting window', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('The window defined in command is not found.');
                });
        });

        it('Switch to child window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to child window', { only: 'chrome', allowMultipleWindows: true });
        });


        it('Switch to other child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to other child', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Switch to deep child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to deep child', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Close specific window from parent', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close specific window from parent', { only: 'chrome', allowMultipleWindows: true });
        });

        it('Close specific window from child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close specific window from child', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('The window defined in command is not found.');
                });
        });

        it('Close specific window and switch to it', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close specific window and switch to it', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('The window defined in command is not found.');
                });
        });

        it('Close parent window and catch error', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close parent window and catch error', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot close window with opened child windows.');
                });
        });

        it('Close unexisting window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close unexisting window', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('The window defined in command is not found');
                });
        });

        it('Close unexisting child window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close unexisting child window', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('The window defined in command is not found.');
                });
        });

        it('Close closed window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close closed window', { only: 'chrome', allowMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('The window defined in command is not found.');
                });
        });
    });
});
