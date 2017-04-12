var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

describe('[Raw API] Select editable content', function () {
    it('Should select editable content in div', function () {
        return runTests('./testcafe-fixtures/select-editable-content.testcafe', 'Select editable content div', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Selected editable content in div', 0);
            });
    });

    it("Should fail if a start element doesn't exist", function () {
        return runTests('./testcafe-fixtures/select-editable-content.testcafe', 'Select editable content in non-existent div', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified "startSelector" does not match any element in the DOM tree.');
                expect(errs[0]).contains('[[Select editable content in non-existent div callsite]]');
            });
    });

    it('Should fail if any element is invisible', function () {
        return runTests('./testcafe-fixtures/select-editable-content.testcafe', 'Select editable content in invisible div', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The element that matches the specified "startSelector" is not visible. ');
                expect(errs[0]).contains('[[Select editable content in invisible div callsite]]');
            });
    });

    it("Should fail if any element isn't content-editable", function () {
        return runTests('./testcafe-fixtures/select-editable-content.testcafe', 'Select in non-content-editable element', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The element that matches the specified "startSelector" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.');
                expect(errs[0]).contains('[[Select in non-content-editable element callsite]]');
            });
    });

    it("Should fail if elements don't have a common ancestor", function () {
        return runTests('./testcafe-fixtures/select-editable-content.testcafe', "Select editable content for nodes that don't have a common ancestor", { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute. ');
                expect(errs[0]).contains("[[Select editable content for nodes that don't have a common ancestor callsite]]");
            });
    });
});
