const { expect }      = require('chai');
const exportableLib   = require('../../../../../../lib/api/exportable-lib');
const { RequestMock, RequestLogger } = exportableLib;

describe('Request Hooks', () => {
    describe('RequestMock', () => {
        it('Basic', () => {
            return runTests('./testcafe-fixtures/request-mock/basic.js', 'Basic', { only: 'chrome' });
        });

        it('Request failed the CORS validation', () => {
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

        it('Global', () => {

            const testPageMarkup = `
                <html>
                    <body>
                        <h1>Mocked page</h1>
                        <h2></h2>
                        <button onclick="sendRequest()"></button>
                        <script>
                            function sendRequest() {
                                fetch('http://dummy-url.com/get')
                                    .then(res => {
                                        return res.text();
                                    })
                                    .then(text => {
                                        document.querySelector('h2').textContent = text;                            
                                    });                    
                            }
                        </script>
                    </body>
                </html>
            `;

            const requestMock = RequestMock()
                .onRequestTo('http://dummy-url.com')
                .respond(testPageMarkup)
                .onRequestTo('http://dummy-url.com/get')
                .respond('Data from mocked fetch request')
                .onRequestTo('https://another-dummy-url.com')
                .respond();

            const hooks = {
                request: requestMock,
            };

            return runTests('./testcafe-fixtures/request-mock/global.js', 'Global', { only: 'chrome', hooks });
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

        it('Global', () => {
            after(() => {
                delete global.pageUrl;
                delete global.logger;
            });

            global.pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';
            global.logger  = new RequestLogger(global.pageUrl);

            const hooks = {
                request: global.logger,
            };

            return runTests('./testcafe-fixtures/request-logger/global.js', 'Global', { only: 'chrome', hooks });
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
    });
});
