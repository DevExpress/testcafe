// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    uncaughtErrorOnPage:               'uncaughtErrorOnPage',
    uncaughtErrorInTestCode:           'uncaughtErrorInTestCode',
    uncaughtNonErrorObjectInTestCode:  'uncaughtNonErrorObjectInTestCode',
    uncaughtErrorInClientExecutedCode: 'uncaughtErrorInClientExecutedCode',

    missingAwaitError: 'missingAwaitError',

    actionIntegerOptionError:               'actionIntegerOptionError',
    actionPositiveIntegerOptionError:       'actionPositiveIntegerOptionError',
    actionBooleanOptionError:               'actionBooleanOptionError',
    actionOptionsTypeError:                 'actionOptionsTypeError',
    actionStringArgumentError:              'actionStringArgumentError',
    actionStringOrStringArrayArgumentError: 'actionStringOrStringArrayArgumentError',
    actionStringArrayElementError:          'actionStringArrayElementError',
    actionIntegerArgumentError:             'actionIntegerArgumentError',
    actionPositiveIntegerArgumentError:     'actionPositiveIntegerArgumentError',
    actionSelectorTypeError:                'actionSelectorTypeError',
    actionAdditionalSelectorTypeError:      'actionAdditionalSelectorTypeError',
    actionUnsupportedUrlProtocolError:      'actionUnsupportedUrlProtocolError',

    actionElementNotFoundError:              'actionElementNotFoundError',
    actionElementIsInvisibleError:           'actionElementIsInvisibleError',
    actionAdditionalElementNotFoundError:    'actionAdditionalElementNotFoundError',
    actionAdditionalElementIsInvisibleError: 'actionAdditionalElementIsInvisibleError',
    actionElementNonEditableError:           'actionElementNonEditableError',
    actionElementNotTextAreaError:           'actionElementNotTextAreaError',
    actionElementNonContentEditableError:    'actionElementNonContentEditableError',
    actionElementIsNotFileInputError:        'actionElementIsNotFileInputError',
    actionRootContainerNotFoundError:        'actionRootContainerNotFoundError',
    actionIncorrectKeysError:                'actionIncorrectKeysError',
    actionCanNotFindFileToUploadError:       'actionCanNotFindFileToUpload',
    clientCodeExecutionInterruptionError:    'clientCodeExecutionInterruptionError',

    externalAssertionLibraryError: 'externalAssertionLibraryError'
};
