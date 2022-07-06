import hammerhead from './deps/hammerhead';
import testCafeAutomation from './deps/testcafe-automation';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';
import { MouseClickStrategyEmpty } from '../../shared/actions/automations/click/mouse-click-strategy-base';

const { Promise, utils: { featureDetection } } = hammerhead;
const { domUtils: dom, positionUtils: position, styleUtils: style, eventUtils: event } = testCafeCore;
const { getOffsetOptions } = testCafeAutomation;


initializeAdapter({
    getOffsetOptions: getOffsetOptions,

    dom, position, style, event, featureDetection,

    // NOTE: this functions are unnecessary in the driver
    getElementExceptUI:          () => Promise.resolve(),
    scroll:                      () => Promise.resolve(),
    createEventSequence:         () => {},
    sendRequestToFrame:          () => Promise.resolve(),
    ensureMouseEventAfterScroll: () => Promise.resolve(),

    automations: {
        click: {
            createMouseClickStrategy: () => new MouseClickStrategyEmpty(),
        },

        _ensureWindowAndCursorForLegacyTests () { // eslint-disable-line no-empty-function
        },
    },
});
