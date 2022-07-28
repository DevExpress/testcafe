const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL, CALLBACK_FUNC_ERROR } = require('./constants');
const config                                                         = require('../../../config');
const expect                                                         = require('chai').expect;


const expectFailAttempt = (errors, expectedMessage) => {
    if (Array.isArray(errors))
        expect(errors[0]).contains(expectedMessage);
    else {
        Object.values(errors).forEach(err => {
            expect(err[0]).contains(expectedMessage);
        });
    }
};

// TODO: fix tests for Debug task
(config.experimentalDebug ? describe.skip : describe)('[Regression](GH-2775)', () => {
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

        it('Should fail due to incorrect message option', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail due to incorrect message option', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail if at least one option is incorrect', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail if at least one option is incorrect', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail with callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail with callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail due to error in callback function', async () => {
            return runTests('./testcafe-fixtures/test-controller.js', 'Should fail due to error in callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CALLBACK_FUNC_ERROR);
                    expectFailAttempt(errs, ' > 62 |    await t.skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE);');
                });
        });
    });

    describe('Fixture and Test method', () => {
        it('Should skip JS errors due to fixture callback', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors due to fixture callback');
        });

        it('Should skip JS errors with callback function specified in test', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with callback function specified in test');
        });

        it('Should skip JS errors with skipJsErrorsOptions object in test', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should skip JS errors with skipJsErrorsOptions object in test');
        });

        it('Should fail due to errors in callback function', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail due to errors in callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CALLBACK_FUNC_ERROR);
                    expectFailAttempt(errs, ' > 32 |}).skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE);');
                });
        });

        it('Should fail due to TestController value override', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail due to TestController value override', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Should fail with test callback function', () => {
            return runTests('./testcafe-fixtures/fixture-and-test.js', 'Should fail with test callback function', { shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });
    });

    describe('Runner run option', () => {
        it('Should skip errors due to runner options', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: CLIENT_PAGE_URL,
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });

        it('Should skip errors due to runner callback', () => {
            const fn           = ({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL;
            const dependencies = { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL };
            const skipJsErrors = { fn, dependencies };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors });
        });

        it('Should fail due to incorrect runner options', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: 'incorrectUrl',
            };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', { skipJsErrors, shouldFail: true })
                .catch(errs => {
                    expectFailAttempt(errs, CLIENT_ERROR_MESSAGE);
                });
        });

        it('Incorrect runner options should be overridden by test skipJsErrors callback', () => {
            const skipJsErrors = {
                message: CLIENT_ERROR_MESSAGE,
                pageUrl: 'incorrectUrl',
            };

            return runTests('./testcafe-fixtures/runner.js', 'Should skip JS errors with callback function specified in test', { skipJsErrors });
        });

        it('Should fail due to error in the callback function specified via runner', () => {
            const fn           = ({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL;
            const dependencies = { CLIENT_PAGE_URL };
            const skipJsErrors = { fn, dependencies };

            return runTests('./testcafe-fixtures/runner.js', 'Throw client error', {
                skipJsErrors,
                shouldFail: true,
            })
                .catch(errs => {
                    expectFailAttempt(errs, CALLBACK_FUNC_ERROR);
                    expectFailAttempt(errs, ' > 289 |                    .run({');
                });
        });
    });
});
