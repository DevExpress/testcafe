var errorInEachBrowserContains            = require('../../../assertion-helper.js').errorInEachBrowserContains;
var errorInEachBrowserNotContains         = require('../../../assertion-helper.js').errorInEachBrowserNotContains;
var getExpectedDialogNotAppearedErrorText = require('../error-text.js').getExpectedDialogNotAppearedErrorText;
var getUnexpectedDialogErrorText          = require('../error-text.js').getUnexpectedDialogErrorText;
var DIALOG_TYPE                           = require('../../../../../lib/test-run/browser-dialogs.js').DIALOG_TYPE;
var config                                = require('../../../config.js');


describe('[ES-NEXT] Native dialogs handling', function () {
    describe('Errors during dialogs handling', function () {
        it("Should fail if the expected alert dialog doesn't appear after an action", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected alert after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '12 |    await t ' +
                        '13 |        .click(\'#withoutDialog\')' +
                        ' > 14 |        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT }); ',
                        0);
                });
        });

        it('Should fail when an unexpected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected alert after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '18 |    await t ' +
                        '> 19 |        .click(\'#buttonAlert\'); ',
                        0);
                });
        });

        it("Should fail if the expected beforeUnload dialog doesn't appear after an action", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected beforeUnload after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.beforeUnload), 0);
                    errorInEachBrowserContains(errs,
                        '24 |    await t ' +
                        '25 |        .click(\'#linkToThisPage\') ' +
                        '> 26 |        .handleBeforeUnloadDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail when an unexpected beforeUnload dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected beforeUnload after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.beforeUnload), 0);
                });
        });

        it('Should fail if execution error and unexpected dialog error raised', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected dialog and another execution error',
                { shouldFail: true, elementAvailabilityTimeout: 400 })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);

                    for (var i = 0; i < errs.length; i++)
                        errorInEachBrowserNotContains(errs, 'The specified selector does not match any element in the DOM tree.', i);

                    errorInEachBrowserContains(errs,
                        '36 |    await ClientFunction(() => window.setTimeout(() => { ' +
                        '37 |        /* eslint-disable no-alert*/ ' +
                        '38 |        window.alert(\'Alert!\'); ' +
                        '39 |        /* eslint-enable no-alert*/ ' +
                        '40 |    }, 200))(); ' +
                        '> 41 |    await t.click(\'#non-existent\'); ' +
                        '42 |});',
                        0);
                });
        });
    });

    describe('Dialogs sequence', function () {
        it('Should pass if dialogs sequence appears after an action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Dialogs sequence appears after an action');
        });

        it("Should fail if the expected prompt dialog doesn't appear after an action", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected prompt in dialogs sequence after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.prompt), 0);
                    errorInEachBrowserContains(errs,
                        '59 |    await t ' +
                        '60 |        .click(\'#buttonAlertConfirm\') ' +
                        '61 |        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT }) ' +
                        '62 |        .handleConfirmDialog(true, { timeout: WAIT_FOR_DIALOG_TIMEOUT }) ' +
                        '> 63 |        .handlePromptDialog(null, { timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail when an unexpected confirm dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected confirm in dialogs sequence after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.confirm), 0);
                    errorInEachBrowserContains(errs,
                        '67 |    await t ' +
                        '> 68 |        .click(\'#buttonAlertConfirmPrompt\') ' +
                        '69 |        .handleAlertDialog() ' +
                        '70 |        .handlePromptDialog();',
                        0);
                });
        });
    });

    describe('Dialog appears after timeout', function () {
        it('Should pass if the wait timeout exceeds the time required for the dialog to appear', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Dialog alert appears with some timeout after redirect');
        });

        it('Should fail if the wait timeout is less than the time required for the dialog to appear', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Dialog alert appears with some timeout after an action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '81 |    await t ' +
                        '82 |        .click(\'#buttonDialogAfterTimeout\') ' +
                        '> 83 |        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail if an unexpected dialog appears while waiting for another dialog', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected dialog appear during waiting for dialog',
                { elementAvailabilityTimeout: 1500, shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '87 |    await t ' +
                        '88 |        .click(\'#buttonDialogAfterTimeout\') ' +
                        '> 89 |        .handleConfirmDialog(false, { timeout: 1500 });',
                        0);
                });
        });
    });

    describe('Dialogs appear after redirect', function () {
        it('Should handle confirm dialogs', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Expected alert and confirm after redirect');
        });

        it('Should handle prompt dialogs', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Expected alert and prompt after redirect');
        });

        it("Should fail if the expected confirm dialog doesn't appear after redirect", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected confirm after redirect',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.confirm), 0);
                    errorInEachBrowserContains(errs,
                        '128 |    await t ' +
                        '129 |        .click(\'#linkToThisPage\') ' +
                        '> 130 |        .handleConfirmDialog(true, { timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail when an unexpected confirm dialog appears after redirect', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected confirm after redirect',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.confirm), 0);
                });
        });
    });

    describe('Dialogs appear after page load', function () {
        it('Should pass if the expected confirm dialog appears after page load', function () {
            return runTests('./testcafe-fixtures/page-load-test.js', 'Expected dialogs after page load');
        });

        it("Should fail if the expected confirm dialog doesn't appear after page load", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected confirm after page load',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.confirm), 0);
                    errorInEachBrowserContains(errs,
                        '139 |    await t ' +
                        '> 140 |        .handleConfirmDialog(true, { timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail when an unexpected alert dialog appears after page load', function () {
            return runTests('./testcafe-fixtures/page-load-test.js', 'Unexpected alert after page load',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs, '> 26 |    await t.click(\'body\'); ', 0);
                });
        });
    });

    if (!config.isTravisTask) {
        describe('Dialogs appear during resizeWindow action', function () {
            it('Should pass if dialog appears during resizeWindow action', function () {
                return runTests('./testcafe-fixtures/resize-test.js', 'Dialog appears during resizeWindow action');
            });

            it("Should fail if the expected alert dialog doesn't appear during resizeWindow action", function () {
                return runTests('./testcafe-fixtures/resize-test.js', 'No expected alert during resizeWindow action',
                    { shouldFail: true })
                    .catch(function (errs) {
                        errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                        errorInEachBrowserContains(errs,
                            '53 |    await t ' +
                            '54 |        .resizeWindow(500, 500) ' +
                            '> 55 |        .handleAlertDialog({ timeout: 200 });',
                            0);

                        for (var i = 0; i < errs.length; i++)
                            errorInEachBrowserNotContains(errs, 'Error in afterEach hook', i);
                    });
            });

            it('Should fail when an unexpected alert dialog appears during resizeWindow action', function () {
                return runTests('./testcafe-fixtures/resize-test.js', 'Unexpected alert during resizeWindow action',
                    { shouldFail: true })
                    .catch(function (errs) {
                        errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);
                        errorInEachBrowserContains(errs,
                            '61 |    await t ' +
                            '> 62 |        .resizeWindow(500, 500);',
                            0);

                        for (var i = 0; i < errs.length; i++)
                            errorInEachBrowserNotContains(errs, 'Error in afterEach hook', i);
                    });
            });
        });
    }

    describe('Dialogs appear during navigateTo action', function () {
        it('Should pass if dialog appears during navigateTo action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Dialog appears during navigateTo action');
        });

        it("Should fail if the expected alert dialog doesn't appear during navigateTo action", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected alert during navigateTo action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '151 |    await t ' +
                        '152 |        .navigateTo(\'index.html\') ' +
                        '> 153 |        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT }) ' +
                        '154 |        .handleConfirmDialog(false, { timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail when an unexpected alert dialog appears during navigateTo action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected confirm during navigateTo action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.confirm), 0);
                    errorInEachBrowserContains(errs,
                        '158 |    await t.navigateTo(\'page-load.html\') ' +
                        '> 159 |        .handleAlertDialog();',
                        0);
                });
        });
    });

    describe('Dialog appears during a wait action', function () {
        it('Should pass if expected alert dialog appears during a wait action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Expected alert during a wait action');
        });

        it("Should fail if the expected alert dialog doesn't appear during a wait action", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'No expected alert during a wait action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '171 |    await t ' +
                        '172 |        .click(\'#buttonDialogAfterTimeout\') ' +
                        '173 |        .wait(10) ' +
                        '> 174 |        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT }); ',
                        0);
                });
        });

        it('Should fail when an unexpected alert dialog appears during a wait action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Unexpected alert during a wait action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);
                });
        });
    });

    describe('Handle dialog action is not chained to previous action', function () {
        it('Should fail when an unexpected alert dialog appears after an action', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Handle dialog command is not chained to action causing alert',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getUnexpectedDialogErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        ' > 185 |    await t.click(\'#buttonAlert\'); ' +
                        '186 |    await t.handleAlertDialog(); ',
                        0);
                });
        });

        it("Should fail if the expected alert dialog doesn't appear after an action", function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Handle dialog command is not chained to action',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                    errorInEachBrowserContains(errs,
                        '190 |    await t.click(\'#withoutDialog\'); ' +
                        '> 191 |    await t.handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });
    });

    describe('Dialog appears during execution of a client function', function () {
        it('Should fail if alert dialog appears during execution of a client function', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Alert during execution of a client function', { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs,
                        'ClientFunction execution was interrupted by a native alert dialog. ' +
                        'Make sure that ClientFunction code does not trigger native dialogs. ' +
                        'If this dialog appears as a result of the previous test action, call the handleAlertDialog' +
                        ' function after the action.',
                        0);

                    errorInEachBrowserContains(errs,
                        '196 |    /* eslint-disable no-alert*/ ' +
                        '> 197 |    await ClientFunction(() => alert(\'Alert!\'))(); ' +
                        '198 |    /* eslint-enable no-alert*/ ' +
                        '199 |    await t.handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });',
                        0);
                });
        });

        it('Should fail if alert dialog appears during execution of a selector', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Alert during execution of a selector', { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs,
                        'Selector execution was interrupted by a native alert dialog. ' +
                        'Make sure that Selector code does not trigger native dialogs. ' +
                        'If this dialog appears as a result of the previous test action, call the handleAlertDialog' +
                        ' function after the action.',
                        0);

                    errorInEachBrowserContains(errs,
                        '203 |    await Selector(() => { ' +
                        '204 |        /* eslint-disable no-alert*/ ' +
                        '205 |        alert(\'Alert!\'); ' +
                        '206 |        /* eslint-enable no-alert*/ ' +
                        '> 207 |        return document.body; ' +
                        '208 |    })(); ' +
                        '209 |    await t.handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT }); ',
                        0);
                });
        });
    });

    describe('Regression', function () {
        it('Should fail if selector raises error', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Execute selector after failed click',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Selector execution raised an error', 0);
                    errorInEachBrowserNotContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                });
        });

        it('Should fail if eval raises error', function () {
            return runTests('./testcafe-fixtures/native-dialogs-test.js', 'Execute eval after failed click',
                { shouldFail: true })
                .catch(function (errs) {
                    errorInEachBrowserContains(errs, 'Eval execution raised an error', 0);
                    errorInEachBrowserNotContains(errs, getExpectedDialogNotAppearedErrorText(DIALOG_TYPE.alert), 0);
                });
        });
    });
});
