var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

describe('[Raw API] Type action', function () {
    it('Should type in an input', function () {
        return runTests('./testcafe-fixtures/type.testcafe', 'Type in simple input', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Type in input raised', 0);
            });
    });

    it("Should type all text in one keystroke if using 'paste' option", function () {
        return runTests('./testcafe-fixtures/type.testcafe', 'Type with paste option', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Type block in one keystroke raised', 0);
            });
    });

    it("Should fail if a 'text' argument does not have string type", function () {
        return runTests('./testcafe-fixtures/type.testcafe', 'Type with numeric text argument', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The "text" argument is expected to be a non-empty string, but it was number.');
                expect(errs[0]).contains('[[Type with numeric text argument callsite]]');
            });
    });

    it("Should fail if a 'text' argument is empty", function () {
        return runTests('./testcafe-fixtures/type.testcafe', 'Type with empty text argument', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The "text" argument is expected to be a non-empty string, but it was "".');
                expect(errs[0]).contains('[[Type with empty text argument callsite]]');
            });
    });
});
