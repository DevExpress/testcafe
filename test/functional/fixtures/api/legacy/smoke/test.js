var expect = require('chai').expect;

describe('[Legacy] Smoke tests', function () {
    it('Should run basic tests', function () {
        this.timeout(60000);

        return runTests('./testcafe-fixtures/basic.test.js', null, { selectorTimeout: 5000 });
    });

    it('Should fail on errors', function () {
        return runTests('./testcafe-fixtures/errors.test.js', null, { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('A target element of the click action has not been found in the DOM tree.');
            });
    });
});
