const { expect }                     = require('chai');
const { castArray }                  = require('lodash');
const { errorInEachBrowserContains } = require('../../assertion-helper.js');
const {
    CLIENT_ERROR_MESSAGE,
    CLIENT_PAGE_URL,
    CLIENT_ERROR_REGEXP,
    SKIP_JS_ERRORS_CALLBACK_OPTIONS,
} = require('./constants');

const { createReporter } = require('../../utils/reporter');
const experimentalDebug  = !!process.env.EXPERIMENTAL_DEBUG;
const proxyless          = !!process.env.PROXYLESS;

const CALLBACK_FUNC_ERROR = proxyless ? 'Error in the skipJsError callback function' : 'An error occurred in skipJsErrors handler code:';

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
                only:       'chrome',
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

    it('unhandled Promise rejection', () => {
        return runTests('./testcafe-fixtures/unhandled-promise-rejection-test.js', 'Click button',
            {
                skipJsErrors: true,
                only:         'chrome',
            });
    });
});

const expectFailAttempt = (errors, expectedMessage) => {
    Object.values(errors).forEach(err => {
        const error = castArray(err);

        expect(error[0].message || error[0]).contains(expectedMessage);
    });
};

// TODO: fix tests for Debug task
(experimentalDebug ? describe.skip : describe)('Customize SkipJSErrors (GH-2775)', () => {
    describe('TestController method', () => {
        it('Should skip JS errors without param', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors without param');
        });

        it('Should skip JS errors with boolean param', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with boolean param');
        });

        it('Should skip JS errors with message and stack options', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with multiple options');
        });

        it('Should skip JS errors with SkipJsErrorsCallbackOptions', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with SkipJsErrorsCallbackOptions');
        });

        it('Should skip JS errors if some SkipJsErrorsCallbackOptions prop is string containing RegExp', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors if some SkipJsErrorsCallbackOptions prop is string containing RegExp');
        });

        it('Should skip JS errors with callback function returning Promise', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with callback function returning Promise', { skip: ['ie'] });
        });

        it('Should skip first error and fail on second error when skipJsError method called twice', async () => {
            const reporterContext = {
                actionsFinished: 0,
                errors:          [],
            };
            const reporter        = createReporter({
                reportTestActionDone: () => {
                    reporterContext.actionsFinished++;
                },
                reportTestDone: (name, testRunInfo) => {
                    reporterContext.errors = testRunInfo.errs;
                },
            });

            return runTests('./testcafe-fixtures/test-controller.js', 'Should correctly skip JS errors with multiple method calls', {
                reporter: [reporter],
            })
                .then(() => {
                    expect(reporterContext.actionsFinished).eql(4 * reporterContext.errors.length);
                    expect(reporterContext.errors[0].code).eql('E1');
                });
        });

        it("Should fail if message option doesn't satisfy the client error message", async () => {
            return runTests('./testcafe-fixtures/test-controller.js', "Should fail if message option doesn't satisfy the client error message", { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it("Should fail if callback function logic doesn't satisfy the client error message", async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail with SkipJsErrorsCallbackOptions', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if error occurred in callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail due to error in callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CALLBACK_FUNC_ERROR);
                });
        });
    });

    describe('Fixture and Test method', () => {
        it('Should skip JS errors with fixture.skipJsErrors', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with callback function specified in fixture');
        });

        it('Should skip JS errors with test.skipJsErrors', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with callback function specified in test');
        });
    });

    describe('Runner option and method', () => {
        it('Should skip errors with SkipJsErrors options object specified in run options', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_REGEXP,
                pageUrl: CLIENT_PAGE_URL,
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });

        it('Should skip errors with SkipJsErrorsCallbackOptions specified in run options', () => {
            const skipJsErrors = SKIP_JS_ERRORS_CALLBACK_OPTIONS;

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });
    });

    describe('Override skipJsErrors option', () => {
        it('runner -> fixture', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: 'incorrectUrl',
            };

            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with callback function specified in fixture', { skipJsErrors });
        });

        it('fixture -> test', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail due to test skipJsErrors(false) method call', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('test -> testController', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail if value specified in test is overridden to false in TestController', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });
    });

    describe('Skip command should be disposed between test runs', () => {
        it('Skip command should be disposed between test runs', () => {
            return runTests('./testcafe-fixtures/skip-command-dispose-test.js', void 0, { shouldFail: true })
                .catch(errs => {
                    errorInEachBrowserContains(errs, 'Custom client error', 0);
                });
        });
    });
});
