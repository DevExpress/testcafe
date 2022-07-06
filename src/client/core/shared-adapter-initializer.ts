// @ts-ignore
import hammerhead from './deps/hammerhead';
import { initializeAdapter } from '../../shared/adapter/index';
import * as position from './utils/position';
import * as style from './utils/style';
import * as event from './utils/event';
import { MouseClickStrategyEmpty } from '../../shared/actions/automations/click/mouse-click-strategy-base';

const { Promise } = hammerhead;


initializeAdapter({
    position, style, event,
    // NOTE: this functions are unnecessary in the core
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
