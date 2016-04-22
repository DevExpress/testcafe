var expect         = require('chai').expect;
var parseUserAgent = require('useragent').parse;

describe('[API] Hybrid function', function () {
    it('Should be correctly dispatched to test run', function () {
        function assertUA (errs, alias, expected) {
            var ua = parseUserAgent(errs[alias][0]).toString();

            expect(ua.indexOf(expected)).eql(0);
        }

        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Get user agent', { shouldFail: true })
            .catch(function (errs) {
                assertUA(errs, 'chrome', 'Chrome');
                assertUA(errs, 'ff', 'Firefox');
                assertUA(errs, 'ie', 'IE');
            });
    });
});
