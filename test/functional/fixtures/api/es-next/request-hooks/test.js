describe('Request Hooks', () => {
    it('RequestMock', () => {
        return runTests('./testcafe-fixtures/request-mock.js', 'Basic', { only: 'chrome' });
    });

    describe('RequestLogger', () => {
        it('API', () => {
            return runTests('./testcafe-fixtures/request-logger/api.js', 'API', { only: 'chrome' });
        });

        it('Log options', () => {
            return runTests('./testcafe-fixtures/request-logger/log-options.js', 'Log options', { only: 'chrome' });
        });

        it('Multi-browser', () => {
            return runTests('./testcafe-fixtures/request-logger/multi-browser.js', 'Multi-browser');
        });
    });

    describe('API', () => {
        it('Add/remove request hooks', () => {
            return runTests('./testcafe-fixtures/api/add-remove-request-hook.js', 'Test', { only: 'chrome' });
        });

        it('Conditional adding', () => {
            return runTests('./testcafe-fixtures/api/conditional-adding.js', 'Conditional adding');
        });
    });
});
