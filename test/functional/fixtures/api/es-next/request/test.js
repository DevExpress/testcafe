const { expect } = require('chai');
const config     = require('../../../../config');

describe('Request', () => {
    if (!config.experimentalDebug) {
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

        it('Should execute a request with method head', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should execute a request with method head');
        });

        it('Should execute a request in an assertion', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should execute a request in an assertion');
        });

        it('Should re-execute a request in an assertion', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should re-execute a request in an assertion');
        });

        it('Should execute basic auth', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should execute basic auth');
        });

        it('Should execute bearer token auth', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should execute bearer token auth');
        });

        it('Should execute API Key auth', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should execute API Key auth');
        });

        it('Should rise an error if url is not valid', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should rise an error if url is not valid', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('Requested url isn\'t valid (crash).');
                    expect(/await t.request\('crash'\)/.test(errs[0])).ok;
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

        if (config.useLocalBrowsers) {
            it('Should interrupt request by timeout', function () {
                return runTests('testcafe-fixtures/request-test.js', 'Should interrupt request by timeout', { shouldFail: true })
                    .catch(function (errs) {
                        expect(errs[0]).contains('within the timeout period');
                        expect(/>.*\|.*await t.request\.get/.test(errs[0])).ok;
                    });
            });
        }

        it('Should send request with cookies', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should send request with cookies');
        });

        it('Should attach cookies to request with another domain if "withCredentials" is true', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should attach cookies to request with another domain if "withCredentials" is true');
        });

        it('Should not attach cookies to request with another domain if "withCredentials" is false', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should not attach cookies to request with another domain if "withCredentials" is false');
        });

        it('Should not set cookies to the client from response', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should not set cookies to the client from response');
        });

        it('Should set cookies to the client from response', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should set cookies to the client from response');
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

        if (config.useLocalBrowsers) {
            it('Should rise request runtime error', function () {
                return runTests('testcafe-fixtures/request-test.js', 'Should rise request runtime error', { shouldFail: true })
                    .catch(function (errs) {
                        expect(errs[0]).contains('The request was interrupted by an error:');
                        expect(/>.*\|.*await t.request\.get/.test(errs[0])).ok;
                    });
            });
        }
    }
    if (config.experimentalDebug) {
        it('Should rise error if the test run in context is not existed', function () {
            return runTests('testcafe-fixtures/request-test.js', 'Should execute a GET request', { shouldFail: true })
                .catch(function (errs) {
                    expect(errs[0]).contains('\'request\' cannot implicitly resolve the test run in context of which it should be executed. Note that you cannot execute \'request\' in the experimental debug mode.');
                });
        });
    }
});
