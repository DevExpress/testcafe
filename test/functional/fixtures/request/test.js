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

    it('Should rise an error if url is not string', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should rise an error if url is not string', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The "url" argument (boolean) is not of expected type (string).');
                expect(/> \d* \| {4}await Request\(true\);/.test(errs[0])).ok;
            });
    });

    it('Should execute request with proxy', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute request with proxy');
    });

    it('Should execute basic auth with proxy', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute basic auth with proxy');
    });

    it('Should execute a request with params in the url', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with params in the url');
    });

    it('Should execute a request with params in the options', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with params in the options');
    });

    it('Should interrupt request by timeout', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should interrupt request by timeout', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('within the timeout period');
            });
    });

    it('Should send request with credentials', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should send request with credentials');
    });

    it('Should return parsed json', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should return parsed json');
    });

    it('Should return text', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should return text');
    });

    it('Should return buffer', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should return buffer');
    });

    it('Should return httpIncomingMessage', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should return httpIncomingMessage');
    });

    it('Should execute a request with url in the options', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with url in the options');
    });

    it('Url from the argument should be more priority then url in the options', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Url from the argument should be more priority then url in the options');
    });

    it('Should execute a request with relative url', function () {
        return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with relative url');
    });
});
