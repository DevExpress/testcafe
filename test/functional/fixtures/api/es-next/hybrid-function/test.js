var expect = require('chai').expect;

describe('[API] Hybrid function', function () {
    it.only('Should be correctly dispatched to test run', function () {
        return runTests('./testcafe-fixtures/hybrid-fn-test.js', 'Get user agent', { shouldFail: true, only: 'ie' })
            .catch(function (errs) {
                expect(errs).eql({});
            });
    });
});
