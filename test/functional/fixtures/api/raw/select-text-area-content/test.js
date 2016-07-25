var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;

describe('[Raw API] Select textarea content', function () {
    it('Should select text in textarea', function () {
        return runTests('./testcafe-fixtures/select-text-area-content.testcafe', 'Select text in textarea', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Selected text in textarea', 0);
            });
    });

    it("Should fail if an action target isn't textarea", function () {
        return runTests('./testcafe-fixtures/select-text-area-content.testcafe', 'Select in non-textarea element', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The action element is expected to be a <textarea>.');
                expect(errs[0]).contains('[[Select in non-textarea element callsite]]');
            });
    });
});
