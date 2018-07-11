const expect = require('chai').expect;

describe('Request Hooks', () => {
    describe('RequestMock', () => {
        it('Basic', () => {
            return runTests('./testcafe-fixtures/request-mock/basic.js', 'Basic', { only: 'chrome' });
        });

        it('Request failed the CORS validation', () => {
            return runTests('./testcafe-fixtures/request-mock/failed-cors-validation.js', 'Failed CORS validation', { only: 'chrome' })
                .then(() => {
                    expect(testReport.warnings).eql([
                        'RequestMock: CORS validation failed for a request specified as { url: "http://dummy-url.com/get" }'
                    ]);
                });
        });
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
