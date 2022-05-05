const { expect } = require('chai');

describe('Request', () => {
    it('Should execute GET request', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a GET request');
    });

    it('Should execute a POST request', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a POST request');
    });

    it('Should execute a request with method get', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method get');
    });

    it('Should execute a request with method post', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method post');
    });

    it('Should execute a request with method delete', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method delete');
    });

    it('Should execute a request with method put', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method put');
    });

    it('Should execute a request with method patch', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method patch');
    });

    it.skip('Should execute a request with method head', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method head');
    });

    it('Should execute a request in an assertion', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request in an assertion');
    });

    it('Should re-execute a request in an assertion', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should re-execute a request in an assertion');
    });

    it.skip('Should execute basic auth', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute basic auth');
    });

    it.skip('Should execute bearer token auth', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute bearer token auth');
    });

    it.skip('Should execute API Key auth', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute API Key auth');
    });

    it.skip('Should rise an error if url is not string', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should rise an error if url is not string', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The "url" argument (boolean) is not of expected type (string).');
                expect(errs[0]).contains('> 191 |    await Request(true);');
            });
    });
});
