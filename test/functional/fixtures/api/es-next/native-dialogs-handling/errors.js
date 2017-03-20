exports.getNativeDialogNotHandledErrorText = function (dialogType, url) {
    return 'A native ' + dialogType + ' dialog was invoked on page "' + url + '", but no handler was set for it. ' +
           'Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.';
};

exports.getUncaughtErrorInNativeDialogHandlerText = function (dialogType, errMsg, url) {
    return 'An error occurred in the native dialog handler called for a native ' + dialogType + ' dialog on page "' +
           url + '":  ' + errMsg;
};
