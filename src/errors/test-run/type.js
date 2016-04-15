// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    uncaughtErrorOnPage:              'uncaughtErrorOnPage',
    uncaughtErrorInTestCode:          'uncaughtErrorInTestCode',
    uncaughtNonErrorObjectInTestCode: 'uncaughtNonErrorObjectInTestCode',

    missingAwaitError: 'missingAwaitError',

    actionNumberOptionError:         'actionNumberOptionError',
    actionPositiveNumberOptionError: 'actionPositiveNumberOptionError',
    actionBooleanOptionError:        'actionBooleanOptionError',
    actionOptionsTypeError:          'actionOptionsTypeError',

    actionSelectorTypeError:       'actionSelectorTypeError',
    actionElementNotFoundError:    'actionElementNotFoundError',
    actionElementIsInvisibleError: 'actionElementIsInvisibleError',

    externalAssertionLibraryError: 'externalAssertionLibraryError'
};
