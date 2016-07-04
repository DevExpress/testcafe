var errorInEachBrowserContains            = require('../../../assertion-helper.js').errorInEachBrowserContains;
var getExpectedDialogNotAppearedErrorText = require('../error-text.js').getExpectedDialogNotAppearedErrorText;
var getUnexpectedDialogErrorText          = require('../error-text.js').getUnexpectedDialogErrorText;
var DIALOG_TYPE                           = require('../../../../../lib/test-run/browser-dialogs.js').DIALOG_TYPE;


describe('[RAW] Native dialogs handling', function () {
    it('Should pass if the expected confirm dialog appears after an action', function () {
        return runTests('./testcafe-fixtures/native-dialogs.testcafe', 'Expected confirm after an action',
            { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Confirm dialog with result: true', 0);
            });
    });

    it("Should fail if the expected confirm dialog doesn't appear after an action", function () {
        return runTests('./testcafe-fixtures/native-dialogs.testcafe', 'No expected confirm after an action',
            { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.confirm), 0);
                errorInEachBrowserContains(errs, '[[No expected confirm after an action callsite]]', 0);
            });
    });

    it('Should fail when an unexpected confirm dialog appears after an action', function () {
        return runTests('./testcafe-fixtures/native-dialogs.testcafe', 'Unexpected confirm after an action',
            { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.confirm), 0);
                errorInEachBrowserContains(errs, '[[Unexpected confirm after an action callsite]]', 0);
            });
    });

    it('Should pass if the expected confirm dialog appears after page load', function () {
        return runTests('./testcafe-fixtures/page-load.testcafe', 'Expected confirm after page load',
            { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Confirm dialog with result: true', 0);
            });
    });

    it("Should fail if the expected confirm dialog doesn't appear after page load", function () {
        return runTests('./testcafe-fixtures/native-dialogs.testcafe', 'No expected confirm after page load',
            { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.confirm), 0);
                errorInEachBrowserContains(errs, '[[No expected confirm after page load callsite]]', 0);
            });
    });

    it('Should fail when an unexpected confirm dialog appears after page load', function () {
        return runTests('./testcafe-fixtures/page-load.testcafe', 'Unexpected confirm after page load',
            { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.confirm), 0);
                errorInEachBrowserContains(errs, '[[Unexpected confirm after page load callsite]]', 0);
            });
    });
});
