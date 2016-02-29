// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    okAssertion:    'legacy|okAssertion',
    notOkAssertion: 'legacy|notOkAssertion',
    eqAssertion:    'legacy|eqAssertion',
    notEqAssertion: 'legacy|notEqAssertion',

    iframeLoadingTimeout:                        'legacy|iframeLoadingTimeout',
    inIFrameTargetLoadingTimeout:                'legacy|inIFrameTargetLoadingTimeout',
    uncaughtJSError:                             'legacy|uncaughtJSError',
    uncaughtJSErrorInTestCodeStep:               'legacy|uncaughtJSErrorInTestCodeStep',
    storeDomNodeOrJqueryObject:                  'legacy|storeDomNodeOrJqueryObject',
    emptyFirstArgument:                          'legacy|emptyFirstArgument',
    invisibleActionElement:                      'legacy|invisibleActionElement',
    incorrectDraggingSecondArgument:             'legacy|incorrectDraggingSecondArgument',
    incorrectPressActionArgument:                'legacy|incorrectPressActionArgument',
    emptyTypeActionArgument:                     'legacy|emptyTypeActionArgument',
    unexpectedDialog:                            'legacy|unexpectedDialog',
    expectedDialogDoesntAppear:                  'legacy|expectedDialogDoesntAppear',
    incorrectSelectActionArguments:              'legacy|incorrectSelectActionArguments',
    incorrectWaitActionMillisecondsArgument:     'legacy|incorrectWaitActionMillisecondsArgument',
    incorrectWaitForActionEventArgument:         'legacy|incorrectWaitForActionEventArgument',
    incorrectWaitForActionTimeoutArgument:       'legacy|incorrectWaitForActionTimeoutArgument',
    waitForActionTimeoutExceeded:                'legacy|waitForActionTimeoutExceeded',
    incorrectGlobalWaitForActionEventArgument:   'legacy|incorrectGlobalWaitForActionEventArgument',
    incorrectGlobalWaitForActionTimeoutArgument: 'legacy|incorrectGlobalWaitForActionTimeoutArgument',
    globalWaitForActionTimeoutExceeded:          'legacy|globalWaitForActionTimeoutExceeded',
    emptyIFrameArgument:                         'legacy|emptyIFrameArgument',
    iframeArgumentIsNotIFrame:                   'legacy|iframeArgumentIsNotIFrame',
    multipleIFrameArgument:                      'legacy|multipleIFrameArgument',
    incorrectIFrameArgument:                     'legacy|incorrectIFrameArgument',
    uploadCanNotFindFileToUpload:                'legacy|uploadCanNotFindFileToUpload',
    uploadElementIsNotFileInput:                 'legacy|uploadElementIsNotFileInput',
    uploadInvalidFilePathArgument:               'legacy|uploadInvalidFilePathArgument',
    pageNotLoaded:                               'legacy|pageNotLoaded'
};
