const { expect }                 = require('chai');
const { skipInNativeAutomation } = require('../../../../utils/skip-in');

describe('Request Hooks', () => {
    describe('RequestMock', () => {
        it('Basic', () => {
            return runTests('./testcafe-fixtures/request-mock/basic.js', 'Basic', { only: 'chrome' });
        });

        skipInNativeAutomation('Request failed the CORS validation', () => {
            return runTests('./testcafe-fixtures/request-mock/failed-cors-validation.js', 'Failed CORS validation', { only: 'chrome' })
                .then(() => {
                    expect(testReport.warnings).eql([
                        'RequestMock: CORS validation failed for a request specified as { url: "http://dummy-url.com/get" }',
                    ]);
                });
        });

        it('Asynchronous response function (GH-4467)', () => {
            return runTests('./testcafe-fixtures/request-mock/async-response-function.js', null, { only: 'chrome' });
        });

        it("Handle error in 'respond' function (GH-6703)", () => {
            return runTests('./testcafe-fixtures/request-mock/respond-error.js', null, { only: 'chrome', shouldFail: true })
                .catch(() => {
                    expect(testReport.errs.length).eql(1);
                    expect(testReport.errs[0]).contains('Error in the "respond" method');
                });
        });

        it('Should not raise an error if response has 500 status code (GH-7213)', () => {
            return runTests('./testcafe-fixtures/request-mock/500-status-code.js', null, { only: 'chrome' });
        });

        it('Delayed response (GH-7683)', function () {
            return runTests('./testcafe-fixtures/request-mock/delayed-response.js', null, { only: 'chrome' });
        });

        it('Mocking non-AJAX javascript resource (GH-7823)', function () {
            return runTests('./testcafe-fixtures/request-mock/7823.js', null, { only: 'chrome' });
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

        it('Request filter rule predicate', () => {
            return runTests('./testcafe-fixtures/request-logger/request-filter-rule-predicate.js', null, { only: 'chrome' });
        });

        it('Log mocked requests', () => {
            return runTests('./testcafe-fixtures/request-logger/mocked-requests.js', null, { only: 'chrome' });
        });

        it('Log response body for requests without response body (GH-7213)', () => {
            return runTests('./testcafe-fixtures/request-logger/without-response-body.js', null, { only: 'chrome' });
        });
    });

    describe('API', () => {
        it('Add/remove request hooks', () => {
            return runTests('./testcafe-fixtures/api/add-remove-request-hook.js', 'Test', { only: 'chrome' });
        });

        it('Conditional adding', () => {
            return runTests('./testcafe-fixtures/api/conditional-adding.js', 'Conditional adding');
        });

        it('Should handle errors inside the overridden methods', () => {
            return runTests('./testcafe-fixtures/api/handle-errors.js', null, { only: 'chrome', shouldFail: true })
                .catch(() => {
                    expect(testReport.errs.length).eql(5);
                    expect(testReport.errs[0]).contains('You should implement the "onRequest" method in the "Hook1" class.');
                    expect(testReport.errs[1]).contains('You should implement the "onResponse" method in the "Hook1" class.');
                    expect(testReport.errs[2]).contains('You should implement the "onResponse" method in the "Hook2" class.');
                    expect(testReport.errs[3]).contains('You should implement the "onRequest" method in the "Hook3" class.');
                    expect(testReport.errs[4]).contains('An unhandled error occurred in the "onResponse" method of the "Hook3" class:\n\nError: Unhandled error.');
                });
        });

        it('Execution order', () => {
            return runTests('./testcafe-fixtures/api/execution-order.js', null, { only: 'chrome' });
        });

        it("Test's request hooks should not override the fixture's request hooks (GH-4122)", () => {
            return runTests('./testcafe-fixtures/api/i4122.js', null, { only: 'chrome' });
        });

        it('Async predicate for request filter rules', () => {
            return runTests('./testcafe-fixtures/api/request-filter-rule-async-predicate.js', null, { only: 'chrome' });
        });

        it('Change and remove response headers', () => {
            return runTests('./testcafe-fixtures/api/change-remove-response-headers.js', null, { only: 'chrome' });
        });

        it('Request hook events should be represented as appropriate classes', () => {
            return runTests('./testcafe-fixtures/api/request-hook-events.js', null, { only: 'chrome' });
        });

        it('Correct execution order for addRequestHooks/removeRequestHooks sequence (GH-3861)', () => {
            return runTests('./testcafe-fixtures/api/gh-3861.js', null, { only: 'chrome' });
        });

        it('TestController API parameter validation', () => {
            return runTests('./testcafe-fixtures/api/parameter-validation.js', null, { only: 'chrome', shouldFail: true })
                .catch(() => {
                    expect(testReport.errs.length).eql(1);
                    expect(testReport.errs[0]).contains('The hook (string) is not of expected type (RequestHook subclass).');
                });
        });

        it('Header names should be lowercased', () => {
            return runTests('./testcafe-fixtures/api/header-names.js', null, { only: 'chrome' });
        });

        it('Set custom header on "onRequest" method (GH-7846)', () => {
            return runTests('./testcafe-fixtures/api/7846.js', null, { only: 'chrome' });
        });

        it('Request hook on skipped test should not affect next test (GH-8229)', () => {
            return runTests('./testcafe-fixtures/api/8229.js', null, { only: 'chrome' });
        });
    });
});
