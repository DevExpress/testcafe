var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
describe('[API] .skip/.only', function () {
    it('Should filter out tests without "only" directive', function () {
        return runTests('./testcafe-fixtures/only-test.js', null, { shouldFail: true, only: 'chrome' })
            .catch(function (errs) {
                expect(errs.length).eql(5);
                expect(errs[0]).contains('Fixture1Test1');
                expect(errs[1]).contains('Fixture2Test1');
                expect(errs[2]).contains('Fixture3Test1');
                expect(errs[3]).contains('Fixture5Test1');
                expect(errs[4]).contains('Fixture5Test3');
            });
    });
});
