const { expect }                 = require('chai');
const createTestCafe             = require('../../../../lib');
const path                       = require('path');
const assertionHelper            = require('../../assertion-helper.js');
const { GREEN_PIXEL, RED_PIXEL } = require('../../assertion-helper');
const { readPngFile }            = require('../../../../lib/utils/promisified-functions');
const config                     = require('../../config');

const SCREENSHOTS_PATH = config.testScreenshotsDir;

async function assertScreenshotColor (fileName, pixel) {
    for (const browser of config.currentEnvironment.browsers) {
        const filePath = path.join(SCREENSHOTS_PATH, 'custom', browser.alias + fileName);
        const png      = await readPngFile(filePath);

        expect(assertionHelper.hasPixel(png, pixel, 0, 0)).eql(true);
    }
}

describe('Multiple windows', () => {
    describe('Switch to the child window', () => {
        it('Click on link', () => {
            return runTests('testcafe-fixtures/switching-to-child/click-on-link.js', null, { only: 'chrome' });
        });

        it('Form submit', () => {
            return runTests('testcafe-fixtures/switching-to-child/form-submit.js', null, { only: 'chrome' });
        });

        it('window.open', () => {
            return runTests('testcafe-fixtures/switching-to-child/call-window-open.js', null, { only: 'chrome' });
        });

        it('Nested pages', () => {
            return runTests('testcafe-fixtures/switching-to-child/nested-pages.js', null, { only: 'chrome' });
        });

        it('Cross domain', () => {
            return runTests('testcafe-fixtures/switching-to-child/cross-domain.js', null, { only: 'chrome' });
        });
    });

    describe('Switch to the parent window', () => {
        it('"window.close" method call', () => {
            return runTests('testcafe-fixtures/switching-to-parent/window-close-call.js', null, { only: 'chrome' });
        });
    });

    describe('Cookie synchonization', () => {
        it('cross-domain', () => {
            return runTests('testcafe-fixtures/cookie-synchronization/cross-domain.js', null, { only: 'chrome' });
        });
    });

    it('Console messages', () => {
        return runTests('testcafe-fixtures/console/console-test.js', null, { only: 'chrome' });
    });

    it('Unhandled JavaScript errors', () => {
        return runTests('testcafe-fixtures/handle-errors/handle-js-errors.js', null, { only: 'chrome', shouldFail: true })
            .catch(errs => {
                expect(errs[0]).to.contain('A JavaScript error occurred on "http://localhost:3000/fixtures/multiple-windows/pages/handle-errors/page-with-js-error.html"');
            });
    });

    it('Close the window immediately after opening (GH-3762)', () => {
        return runTests('testcafe-fixtures/close-window-immediately-after-opening.js', null, { only: 'chrome' });
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
                    .run();
            })
            .then(() => {
                return testCafe.close();
            });
    });

    describe('Should not finalize some commands on driver starting (GH-4855)', () => {
        it('ExecuteSelectorCommand', () => {
            return runTests('testcafe-fixtures/i4855.js', 'ExecuteSelectorCommand', { only: 'chrome' });
        });

        it('ExecuteClientFunctionCommand', () => {
            return runTests('testcafe-fixtures/i4855.js', 'ExecuteClientFunctionCommand', { only: 'chrome' });
        });
    });

    it('Should correctly synchronize a cookie from a new same-domain window', () => {
        return runTests('testcafe-fixtures/cookie-synchronization/same-domain.js', null, { only: 'chrome' });
    });

    it('Should continue debugging when a child window closes', () => {
        return runTests('testcafe-fixtures/debug-synchronization.js', null, { only: 'chrome' });
    });

    it('Should make screenshots of different windows', () => {
        return runTests('testcafe-fixtures/features/screenshots.js', null, { setScreenshotPath: true })
            .then(() => {
                return assertScreenshotColor('0.png', RED_PIXEL);
            })
            .then(() => {
                return assertScreenshotColor('1.png', GREEN_PIXEL);
            })
            .then(() => {
                return assertScreenshotColor('2.png', RED_PIXEL);
            })
            .then(() => {
                return assertScreenshotColor('3.png', GREEN_PIXEL);
            })
            .then(() => {
                assertionHelper.removeScreenshotDir();
            });
    });

    it('Should recreate close window watcher after new child window is opened', () => {
        return runTests('testcafe-fixtures/i5857.js');
    });

    it('Should throw error if cannot restore child links', () => {
        return runTests('testcafe-fixtures/i4760.js', null, { only: 'chrome', shouldFail: true })
            .catch(errs => {
                expect(errs[0]).to.contain('Failed to restore connection to window within the allocated timeout.');
            });
    });

    describe('API', () => {
        it('Open child window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Open child window', { only: 'chrome' });
        });

        it('Open slow child window ', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Open slow child window', { only: 'chrome' });
        });

        it('Close current window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close current window', { only: 'chrome' });
        });

        it('Get current window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Get current window', { only: 'chrome' });
        });

        it('Switch to parent window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to parent window', { only: 'chrome', speed: 0.01 });
        });

        it('Switch to unexisting parent window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to unexisting parent window', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the parent window. Make sure that the tested window was opened from another window.');
                });
        });

        it('Switch to unexisting window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to unexisting window', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the window specified in the action parameters.');
                });
        });

        it('Switch to child window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to child window', { only: 'chrome' });
        });

        it('Switch to window by url', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to window by url', { only: 'chrome' });
        });

        it('Switch to window by title', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to window by title', { only: 'chrome' });
        });

        it('Multiple windows are found warning', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Multiple windows are found warning', { only: 'chrome' })
                .then(() => {
                    expect(testReport.warnings.length).eql(1);
                    expect(testReport.warnings[0]).eql('The predicate function passed to the \'switchToWindow\' method matched multiple windows. The first matching window was activated.');
                });
        });

        it('Switch to window by predicate with error', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to window by predicate with error', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('An error occurred inside the "switchToWindow" argument function.  Error details: Cannot read property \'field\' of undefined');
                });
        });

        it('Switch to previous window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to previous window', { only: 'chrome' });
        });

        it('Switch to previous closed window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to previous closed window', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the previous window. Make sure that the previous window is opened.');
                });
        });

        it('Switch to other child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to other child', { only: 'chrome' });
        });

        it('Switch to deep child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Switch to deep child', { only: 'chrome' });
        });

        it('Close specific window from parent', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close specific window from parent', { only: 'chrome' });
        });

        it('Close window and check master did not changed', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close window and check master did not changed', { only: 'chrome' });
        });

        it('Close specific window from child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close specific window from child', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the window specified in the action parameters.');
                });
        });

        it('Close specific window and switch to it', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close specific window and switch to it', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the window specified in the action parameters.');
                });
        });

        it('Close parent window and catch error', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close parent window and catch error', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot close a window that has an open child window.');
                });
        });

        it('Close unexisting window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close unexisting window', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the window specified in the action parameters');
                });
        });

        it('Close unexisting child window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close unexisting child window', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the window specified in the action parameters.');
                });
        });

        it('Close closed window', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close closed window', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Cannot find the window specified in the action parameters.');
                });
        });

        it('Close window without parent', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Close window without parent', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain(
                        'Cannot close the window because it does not have a parent. The parent window was closed ' +
                        'or you are attempting to close the root browser window where tests were launched.'
                    );
                });
        });

        it('Open window with `disableMultipleWindows` option', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Open window with `disableMultipleWindows` option', { only: 'chrome', disableMultipleWindows: true, shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).to.contain('Multi-window mode is disabled. To use the "openWindow" method, remove the "disableMultipleWindows" option.');
                });
        });

        it('Refresh parent and switch to child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Refresh parent and switch to child', { only: 'chrome' });
        });

        it('Refresh parent and remove child', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Refresh parent and remove child', { only: 'chrome' });
        });

        it('Refresh parent with multiple children', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Refresh parent with multiple children', { only: 'chrome' });
        });

        it('Refresh child and close', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Refresh child and close', { only: 'chrome' });
        });

        it('Refresh child and switch to parent', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Refresh child and switch to parent', { only: 'chrome' });
        });
    });

    describe('iFrames', () => {
        it('Should switch to child window if it is opened from iFrame', () => {
            return runTests('testcafe-fixtures/iframe.js', 'Open child window from iframe');
        });

        it('Reload child window opened from iframe', () => {
            return runTests('testcafe-fixtures/iframe.js', 'Reload child window opened from iframe');
        });
    });

    describe('Emulation', () => {
        it('Should resize window when emulating device', async () => {
            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    return testCafe
                        .createRunner()
                        .src(path.join(__dirname, './testcafe-fixtures/features/emulation.js'))
                        .browsers('chrome:emulation:device=iphone X')
                        .run();
                })
                .then(failedCount => {
                    expect(failedCount).eql(0);

                    return testCafe.close();
                });
        });
    });

    describe('Resize', () => {
        function runTestsResize (browser) {
            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    testCafe = tc;
                })
                .then(() => {
                    return testCafe
                        .createRunner()
                        .src(path.join(__dirname, './testcafe-fixtures/api/api-test.js'))
                        .filter(testName => testName === 'Resize multiple windows')
                        .browsers(browser)
                        .run();
                })
                .then(failedCount => {
                    expect(failedCount).eql(0);

                    return testCafe.close();
                });
        }

        it('Resize multiple windows', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Resize multiple windows');
        });

        it('Maximize multiple windows', () => {
            return runTests('testcafe-fixtures/api/api-test.js', 'Maximize multiple windows');
        });

        it('Resize headless', () => {
            return runTestsResize('firefox:headless').then(() => {
                return runTestsResize('chrome:headless');
            });
        });
    });
});
