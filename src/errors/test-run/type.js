// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    okAssertion:    'okAssertion',
    notOkAssertion: 'notOkAssertion',
    eqAssertion:    'eqAssertion',
    notEqAssertion: 'notEqAssertion',

    iframeLoadingTimeout:                        'iframeLoadingTimeout',
    inIFrameTargetLoadingTimeout:                'inIFrameTargetLoadingTimeout',
    uncaughtJSError:                             'uncaughtJSError',
    uncaughtJSErrorInTestCodeStep:               'uncaughtJSErrorInTestCodeStep',
    storeDomNodeOrJqueryObject:                  'storeDomNodeOrJqueryObject',
    emptyFirstArgument:                          'emptyFirstArgument',
    invisibleActionElement:                      'invisibleActionElement',
    incorrectDraggingSecondArgument:             'incorrectDraggingSecondArgument',
    incorrectPressActionArgument:                'incorrectPressActionArgument',
    emptyTypeActionArgument:                     'emptyTypeActionArgument',
    unexpectedDialog:                            'unexpectedDialog',
    expectedDialogDoesntAppear:                  'expectedDialogDoesntAppear',
    incorrectSelectActionArguments:              'incorrectSelectActionArguments',
    incorrectWaitActionMillisecondsArgument:     'incorrectWaitActionMillisecondsArgument',
    incorrectWaitForActionEventArgument:         'incorrectWaitForActionEventArgument',
    incorrectWaitForActionTimeoutArgument:       'incorrectWaitForActionTimeoutArgument',
    waitForActionTimeoutExceeded:                'waitForActionTimeoutExceeded',
    incorrectGlobalWaitForActionEventArgument:   'incorrectGlobalWaitForActionEventArgument',
    incorrectGlobalWaitForActionTimeoutArgument: 'incorrectGlobalWaitForActionTimeoutArgument',
    globalWaitForActionTimeoutExceeded:          'globalWaitForActionTimeoutExceeded',
    emptyIFrameArgument:                         'emptyIFrameArgument',
    iframeArgumentIsNotIFrame:                   'iframeArgumentIsNotIFrame',
    multipleIFrameArgument:                      'multipleIFrameArgument',
    incorrectIFrameArgument:                     'incorrectIFrameArgument',
    uploadCanNotFindFileToUpload:                'uploadCanNotFindFileToUpload',
    uploadElementIsNotFileInput:                 'uploadElementIsNotFileInput',
    uploadInvalidFilePathArgument:               'uploadInvalidFilePathArgument',
    pageNotLoaded:                               'pageNotLoaded'
};
