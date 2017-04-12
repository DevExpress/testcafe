var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

describe('[Raw API] Select text', function () {
    it('Should select text in input', function () {
        return runTests('./testcafe-fixtures/select-text.testcafe', 'Select text in input', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Selected text in input', 0);
            });
    });

    it('Should select text in textarea', function () {
        return runTests('./testcafe-fixtures/select-text.testcafe', 'Select text in textarea', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Selected text in textarea', 0);
            });
    });

    it('Should select editable content in div', function () {
        return runTests('./testcafe-fixtures/select-text.testcafe', 'Select editable content in div', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Selected editable content', 0);
            });
    });

    it("Should fail if an action's target isn't editable", function () {
        return runTests('./testcafe-fixtures/select-text.testcafe', 'Select in non-editable element', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).');
                expect(errs[0]).contains('[[Select in non-editable element callsite]]');
            });
    });
});
