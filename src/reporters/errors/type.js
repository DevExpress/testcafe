// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    okAssertion:    'okAssertion',
    notOkAssertion: 'notOkAssertion',
    eqAssertion:    'eqAssertion',
    notEqAssertion: 'notEqAssertion',

    //CLIENT_ERR.XHR_REQUEST_TIMEOUT
    xhrRequestTimeout:                       'xhrRequestTimeout',
    //CLIENT_ERR.IFRAME_LOADING_TIMEOUT
    iframeLoadingTimeout:                    'iframeLoadingTimeout',
    //CLIENT_ERR.IN_IFRAME_TARGET_LOADING_TIMEOUT
    inIFrameTargetLoadingTimeout:            'inIFrameTargetLoadingTimeout',
    //Hammerhead.CLIENT_ERRS.URL_UTIL_PROTOCOL_IS_NOT_SUPPORTED
    urlUtilProtocolIsNotSupported:           'urlUtilProtocolIsNotSupported',
    //CLIENT_ERR.UNCAUGHT_JS_ERROR
    uncaughtJSError:                         'uncaughtJSError',
    //CLIENT_ERR.UNCAUGHT_JS_ERROR_IN_TEST_CODE_STEP
    uncaughtJSErrorInTestCodeStep:           'uncaughtJSErrorInTestCodeStep',
    //CLIENT_ERR.STORE_DOM_NODE_OR_JQUERY_OBJECT
    storeDomNodeOrJqueryObject:              'storeDomNodeOrJqueryObject',
    //CLIENT_ERR.API_EMPTY_FIRST_ARGUMENT
    emptyFirstArgument:                      'emptyFirstArgument',
    //CLIENT_ERR.API_INVISIBLE_ACTION_ELEMENT
    invisibleActionElement:                  'invisibleActionElement',
    //CLIENT_ERR.API_INCORRECT_DRAGGING_SECOND_ARGUMENT
    incorrectDraggingSecondArgument:         'incorrectDraggingSecondArgument',
    //CLIENT_ERR.API_INCORRECT_PRESS_ACTION_ARGUMENT
    incorrectPressActionArgument:            'incorrectPressActionArgument',
    //CLIENT_ERR.API_EMPTY_TYPE_ACTION_ARGUMENT
    emptyTypeActionArgument:                 'emptyTypeActionArgument',
    //CLIENT_ERR.API_UNEXPECTED_DIALOG
    unexpectedDialog:                        'unexpectedDialog',
    //CLIENT_ERR.API_EXPECTED_DIALOG_DOESNT_APPEAR
    expectedDialogDoesntAppear:              'expectedDialogDoesntAppear',
    //CLIENT_ERR.API_INCORRECT_SELECT_ACTION_ARGUMENTS
    incorrectSelectActionArguments:          'incorrectSelectActionArguments',
    //CLIENT_ERR.API_INCORRECT_WAIT_ACTION_MILLISECONDS_ARGUMENT
    incorrectWaitActionMillisecondsArgument: 'incorrectWaitActionMillisecondsArgument',
    //CLIENT_ERR.API_INCORRECT_WAIT_FOR_ACTION_EVENT_ARGUMENT
    incorrectWaitForActionEventArgument:     'incorrectWaitForActionEventArgument',
    //CLIENT_ERR.API_INCORRECT_WAIT_FOR_ACTION_TIMEOUT_ARGUMENT
    incorrectWaitForActionTimeoutArgument:   'incorrectWaitForActionTimeoutArgument',
    //CLIENT_ERR.API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED
    waitForActionTimeoutExceeded:            'waitForActionTimeoutExceeded',
    //CLIENT_ERR.API_EMPTY_IFRAME_ARGUMENT
    emptyIFrameArgument:                     'emptyIFrameArgument',
    //CLIENT_ERR.API_IFRAME_ARGUMENT_IS_NOT_IFRAME
    iframeArgumentIsNotIFrame:               'iframeArgumentIsNotIFrame',
    //CLIENT_ERR.API_MULTIPLE_IFRAME_ARGUMENT
    multipleIFrameArgument:                  'multipleIFrameArgument',
    //CLIENT_ERR.API_INCORRECT_IFRAME_ARGUMENT
    incorrectIFrameArgument:                 'incorrectIFrameArgument',
    //CLIENT_ERR.API_UPLOAD_CAN_NOT_FIND_FILE_TO_UPLOAD
    uploadCanNotFindFileToUpload:            'uploadCanNotFindFileToUpload',
    //CLIENT_ERR.API_UPLOAD_ELEMENT_IS_NOT_FILE_INPUT
    uploadElementIsNotFileInput:             'uploadElementIsNotFileInput',
    //CLIENT_ERR.API_UPLOAD_INVALID_FILE_PATH_ARGUMENT
    uploadInvalidFilePathArgument:           'uploadInvalidFilePathArgument'
};
