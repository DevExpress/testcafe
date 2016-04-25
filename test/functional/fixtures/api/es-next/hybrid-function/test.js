var expect         = require('chai').expect;
var parseUserAgent = require('useragent').parse;

describe('[API] Hybrid function', function () {
    it('Should be correctly dispatched to test run', function () {
        function assertUA (errs, alias, expected) {
            var ua = parseUserAgent(errs[alias][0]).toString();

            expect(ua.indexOf(expected)).eql(0);
        }

        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Dispatch', { shouldFail: true })
            .catch(function (errs) {
                assertUA(errs, 'chrome', 'Chrome');
                assertUA(errs, 'ff', 'Firefox');
                assertUA(errs, 'ie', 'IE');
            });
    });

    it('Should accept arguments', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Call with arguments');
    });

    it('Should perform Hammerhead code instrumentation on function code', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Hammerhead code instrumentation');
    });
});
