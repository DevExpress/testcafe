var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Press action', function () {
    it('Clear input value with shortcuts', function () {
        return runTests('./testcafe-fixtures/press-key.testcafe', 'Clear input value', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Input value is ""', 0);
            });
    });

    it('Should fail if keys command is incorrect', function () {
        return runTests('./testcafe-fixtures/press-key.testcafe', 'Incorrect keys command', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The "keys" argument contains an incorrect key or key combination.');
                expect(errs[0]).contains('[[Incorrect keys command callsite]]');
            });
    });
});
