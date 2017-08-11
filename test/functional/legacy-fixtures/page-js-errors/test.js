var expect                     = require('chai').expect;
var CUSTOM_JS_ERROR            = '%TC_TEST_ERR%';
var errorInEachBrowserContains = require('../../assertion-helper.js').errorInEachBrowserContains;

const TEST_DURATION_BOUND = 10000;

describe('[Legacy] Uncaught js errors', function () {
    it('Should fail if there is no onerror handler', function () {
        return runTests('testcafe-fixtures/no-handler.test.js', null, { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, CUSTOM_JS_ERROR, 0);
            });
    });

    it('Should fail if the onerror handler returns undefined', function () {
        return runTests('testcafe-fixtures/handler-returns-undefined.test.js', null, { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, CUSTOM_JS_ERROR, 0);
            });
    });

    it("Should fail if iframe's onerror handler returns undefined", function () {
        return runTests('testcafe-fixtures/same-domain-iframe.test.js', null, { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, CUSTOM_JS_ERROR, 0);
            });
    });

    it('Should fail if the loaded page throws an error', function () {
        return runTests('testcafe-fixtures/loaded.test.js', null, { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, CUSTOM_JS_ERROR, 0);
            });
    });

    it('Should pass if an error is raised in a cross-domain iframe', function () {
        return runTests('testcafe-fixtures/cross-domain-iframe.test.js');
    });

    it('Should pass if the onerror handler returns true', function () {
        return runTests('testcafe-fixtures/handler-returns-true.test.js');
    });

    it('Should pass if there is no onerror handler and skipJsErrors option enabled', function () {
        return runTests('testcafe-fixtures/no-handler.test.js', null, { skipJsErrors: true });
    });

    it('Should pass if the onerror handler returns undefined and skipJsErrors option enabled', function () {
        return runTests('testcafe-fixtures/handler-returns-undefined.test.js', null, { skipJsErrors: true });
    });

    it("Should pass if iframe's onerror handler returns undefined and skipJsErrors option enabled", function () {
        return runTests('testcafe-fixtures/same-domain-iframe.test.js', null, { skipJsErrors: true });
    });

    it('Should pass if the loaded page throws an error and skipJsErrors option enabled', function () {
        return runTests('testcafe-fixtures/loaded.test.js', null, { skipJsErrors: true });
    });

    describe('Regression', function () {
        it('Should include destination URL in the error message', function () {
            return runTests('testcafe-fixtures/no-handler.test.js', null, { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'on page "http://localhost:3000/legacy-fixtures/page-js-errors/pages/no-handler.html"', 0);
                });
        });

        it('Test report should contains correct duration time (GH-22)', function () {
            return runTests('./testcafe-fixtures/unreachable-page.test.js', 'Unreachable page')
                .catch(function (errs) {
                    expect(testReport.durationMs).below(TEST_DURATION_BOUND);
                    errorInEachBrowserContains(errs, 'Failed to find a DNS-record for the resource at', 0);
                });
        });
    });
});
