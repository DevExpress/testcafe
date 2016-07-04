var EXPECTED_HANDLER_TYPE = require('../../../../lib/test-run/browser-dialogs.js').EXPECTED_HANDLER_TYPE;

exports.getExpectedDialogNotAppearedErrorText = function getExpectedDialogNotAppearedErrorText (dialogType) {
    return 'The expected native ' + dialogType + ' dialog did not appear.' +
           ' Make sure that this dialog is invoked and the ' + EXPECTED_HANDLER_TYPE[dialogType] +
           ' function\'s "timeout" setting provides sufficient time for it to appear.';
};

exports.getUnexpectedDialogErrorText = function (dialogType) {
    return 'An unexpected native ' + dialogType + ' dialog appeared.' +
           ' If this dialog was invoked as a result of a test action, call the ' + EXPECTED_HANDLER_TYPE[dialogType] +
           ' function after the action.';
};
