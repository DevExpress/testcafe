// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    uncaughtErrorOnPage:               'uncaughtErrorOnPage',
    uncaughtErrorInTestCode:           'uncaughtErrorInTestCode',
    uncaughtNonErrorObjectInTestCode:  'uncaughtNonErrorObjectInTestCode',
    uncaughtErrorInClientFunctionCode: 'uncaughtErrorInClientFunctionCode',

    missingAwaitError: 'missingAwaitError',

    actionPositiveIntegerOptionError:       'actionPositiveIntegerOptionError',
    actionBooleanOptionError:               'actionBooleanOptionError',
    actionOptionsTypeError:                 'actionOptionsTypeError',
    actionStringArgumentError:              'actionStringArgumentError',
    actionStringOrStringArrayArgumentError: 'actionStringOrStringArrayArgumentError',
    actionStringArrayElementError:          'actionStringArrayElementError',
    actionIntegerArgumentError:             'actionIntegerArgumentError',
    actionPositiveIntegerArgumentError:     'actionPositiveIntegerArgumentError',
    actionUnsupportedUrlProtocolError:      'actionUnsupportedUrlProtocolError',

    actionSelectorError:           'actionSelectorError',
    actionAdditionalSelectorError: 'actionAdditionalSelectorError',

    actionElementNotFoundError:              'actionElementNotFoundError',
    actionElementIsInvisibleError:           'actionElementIsInvisibleError',
    actionAdditionalElementNotFoundError:    'actionAdditionalElementNotFoundError',
    actionAdditionalElementIsInvisibleError: 'actionAdditionalElementIsInvisibleError',
    actionElementNonEditableError:           'actionElementNonEditableError',
    actionElementNotTextAreaError:           'actionElementNotTextAreaError',
    actionElementNotIframeError:             'actionElementNotIframeError',
    actionElementNonContentEditableError:    'actionElementNonContentEditableError',
    actionElementIsNotFileInputError:        'actionElementIsNotFileInputError',
    actionRootContainerNotFoundError:        'actionRootContainerNotFoundError',
    actionIncorrectKeysError:                'actionIncorrectKeysError',
    actionCanNotFindFileToUploadError:       'actionCanNotFindFileToUploadError',
    actionUnsupportedDeviceTypeError:        'actionUnsupportedDeviceTypeError',
    actionIframeIsNotLoadedError:            'actionIframeIsNotLoadedError',
    currentIframeIsNotLoadedError:           'currentIframeIsNotLoadedError',
    currentIframeNotFoundError:              'currentIframeNotFoundError',
    currentIframeIsInvisibleError:           'currentIframeIsInvisibleError',

    clientFunctionExecutionInterruptionError:           'clientFunctionExecutionInterruptionError',
    regeneratorInFunctionArgumentOfClientFunctionError: 'regeneratorInFunctionArgumentOfClientFunctionError',
    domNodeClientFunctionResultError:                   'domNodeClientFunctionResultError',

    externalAssertionLibraryError: 'externalAssertionLibraryError',

    pageLoadError: 'pageLoadError'
};
