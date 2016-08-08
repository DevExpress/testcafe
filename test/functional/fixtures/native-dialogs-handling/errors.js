exports.getNativeDialogNotHandledErrorText = function (dialogType) {
    return 'A native ' + dialogType + ' dialog was invoked, but no handler was set for it. ' +
           'Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.';
};

exports.getUncaughtErrorInNativeDialogHandlerText = function (dialogType, errMsg) {
    return 'An error occurred in the native dialog handler called for a native ' + dialogType + ' dialog:  ' + errMsg;
};
