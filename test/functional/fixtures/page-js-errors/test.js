const { expect }                     = require('chai');
const { castArray }                  = require('lodash');
const { errorInEachBrowserContains } = require('../../assertion-helper.js');
const {
    CLIENT_ERROR_MESSAGE,
    CLIENT_PAGE_URL,
    CALLBACK_FUNC_ERROR,
    CLIENT_ERROR_REGEXP,
    CLIENT_PAGE_URL_REGEXP,
} = require('./constants');

const experimentalDebug = !!process.env.EXPERIMENTAL_DEBUG;

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
(experimentalDebug ? describe.skip : describe)('[Regression](GH-2775) SkipJSErrors API', () => {
    describe('TestController command', () => {
        it('Should skip JS errors with boolean param', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with boolean param');
        });

        it('Should skip JS errors with only message param', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with only message param');
        });

        it('Should skip JS errors with multiple options', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with multiple options');
        });

        it('Should skip JS errors with callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with callback function');
        });

        it('Should skip JS errors with regular expression in message', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors with regular expression in message');
        });

        it('Should fail if the regexp message option doesnt satisfy the client error message', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail if the regexp message option doesnt satisfy the client error message', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if the message option doesnt satisfy the client error message', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail due to incorrect message option', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if callback function logic doesnt satisfy the client error message', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail with callback function', { shouldFail: true })
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

        it('Should skip JS errors with async callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should skip JS errors, with async callback function', { skip: ['ie'] });
        });

        it('Should fail if async callback function does not satisfy the error message', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail if async callback function does not satisfy the error message', {
                shouldFail: true,
                skip:       ['ie'],
            })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });
    });

    describe('Fixture and Test method', () => {
        it('Should skip JS errors with callback function specified in fixture', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with callback function specified in fixture');
        });

        it('Should skip JS errors with callback function specified in test', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with callback function specified in test');
        });

        it('Should skip JS errors with skipJsErrorsOptions object specified in test', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with skipJsErrorsOptions object in test');
        });

        it('Should skip JS errors with regular expression in message', async () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with regular expression in message');
        });

        it('Should fail if the regexp message option doesnt satisfy the client error message', async () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail if the regexp message option doesnt satisfy the client error message', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if error occurred in callback function', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail if error occurred in callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CALLBACK_FUNC_ERROR);
                });
        });

        it('Should fail if test callback function logic doesnt satisfy the client error message', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail with test callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });
    });

    describe('Runner run option', () => {
        it('Should skip errors with SkipJsErrors options object specified in runner', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: CLIENT_PAGE_URL,
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });

        it('Should skip errors with SkipJsErrors callback function specified in runner', () => {
            const fn           = ({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL;
            const dependencies = { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL };
            const skipJsErrors = { fn, dependencies };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });

        it('Should skip errors with SkipJsErrorsOptions regular expression specified in runner', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_REGEXP,
                pageUrl: CLIENT_PAGE_URL_REGEXP,
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });


        it('Should fail if test SkipJsErrorsOptions regular expression doesnt satisfy the client error message', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_REGEXP,
                pageUrl: /incorrectRegularExpression/,
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors, shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if test SkipJsErrorsOptions object doesnt satisfy the client error message', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: 'incorrectUrl',
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors, shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if error occurred in callback function', () => {
            const fn           = ({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL;
            const dependencies = { CLIENT_PAGE_URL };
            const skipJsErrors = { fn, dependencies };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', {
                skipJsErrors,
                shouldFail: true,
            })
                .catch(errs => {
                    expectFailAttempt(errs, CALLBACK_FUNC_ERROR);
                });
        });
    });

    describe('Override skipJsErrors option', () => {
        it('Should skip errors if incorrect runner options are overridden by correct test skipJsErrors callback', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: 'incorrectUrl',
            };

            return runTests('./testcafe-fixtures/runner.js', 'Should skip JS errors with callback function specified in test', { skipJsErrors });
        });

        it('Should fail if value specified in test is overridden to false in TestController', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail if value specified in test is overridden to false in TestController', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if value specified in runner and test is overridden to false in TestController', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: CLIENT_PAGE_URL,
            };

            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail if value specified in test is overridden to false in TestController', {
                shouldFail: true,
                skipJsErrors,
            })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });
    });
});

