const { expect } = require('chai');

describe('Request timeout', () => {
    describe('Test level', () => {
        it('Page request timeout', () => {
            return runTests('testcafe-fixtures/test-level.js', 'page request timeout', { only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).contain('Failed to complete a request to "http://localhost:3000/fixtures/run-options/request-timeout/pages/page.html?delay=5000" within the timeout period.');
                });
        });

        it('Ajax request timeout', () => {
            return runTests('testcafe-fixtures/test-level.js', 'ajax request timeout', { only: 'chrome' });
        });
    });

    describe('Run level', () => {
        it('Page request timeout', () => {
            return runTests('testcafe-fixtures/run-level.js', 'page request timeout', { pageRequestTimeout: 100, only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).contain('Failed to complete a request to "http://localhost:3000/fixtures/run-options/request-timeout/pages/page.html?delay=5000" within the timeout period.');
                });
        });

        it('Ajax request timeout', () => {
            return runTests('testcafe-fixtures/run-level.js', 'ajax request timeout', { ajaxRequestTimeout: 100, only: 'chrome' });
        });
    });

    describe('Overriding', () => {
        it('Page request timeout', () => {
            return runTests('testcafe-fixtures/test-level.js', 'page request timeout', { pageRequestTimeout: 100000, only: 'chrome', shouldFail: true })
                .catch(errs => {
                    expect(errs[0]).contain('Failed to complete a request to "http://localhost:3000/fixtures/run-options/request-timeout/pages/page.html?delay=5000" within the timeout period.');
                });
        });

        it('Ajax request timeout', () => {
            return runTests('testcafe-fixtures/test-level.js', 'ajax request timeout', { ajaxRequestTimeout: 100000, only: 'chrome' });
        });
    });
});
