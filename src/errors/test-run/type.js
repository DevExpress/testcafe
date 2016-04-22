// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export default {
    uncaughtErrorOnPage:              'uncaughtErrorOnPage',
    uncaughtErrorInTestCode:          'uncaughtErrorInTestCode',
    uncaughtNonErrorObjectInTestCode: 'uncaughtNonErrorObjectInTestCode',

    missingAwaitError: 'missingAwaitError',

    actionIntegerOptionError:         'actionIntegerOptionError',
    actionPositiveIntegerOptionError: 'actionPositiveIntegerOptionError',
    actionBooleanOptionError:         'actionBooleanOptionError',
    actionOptionsTypeError:           'actionOptionsTypeError',
    actionSelectorTypeError:          'actionSelectorTypeError',
    dragDestinationSelectorTypeError: 'dragDestinationSelectorTypeError',

    actionElementNotFoundError:      'actionElementNotFoundError',
    actionElementIsInvisibleError:   'actionElementIsInvisibleError',
    dragDestinationNotFoundError:    'dragDestinationNotFoundError',
    dragDestinationIsInvisibleError: 'dragDestinationIsInvisibleError',

    externalAssertionLibraryError: 'externalAssertionLibraryError'
};
