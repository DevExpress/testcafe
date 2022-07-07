import { initializeAdapter } from '../../shared/adapter/index';

initializeAdapter({
    // NOTE: this functions are unnecessary in the driver

    automations: {
        _ensureWindowAndCursorForLegacyTests () { // eslint-disable-line no-empty-function
        },
    },
});
