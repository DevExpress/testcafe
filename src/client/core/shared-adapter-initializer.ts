// @ts-ignore
import hammerhead from './deps/hammerhead';
import { initializeAdapter } from '../../shared/adapter/index';
import * as dom from './utils/dom';
import * as position from './utils/position';
import * as style from './utils/style';
import * as event from './utils/event';
import { MouseClickStrategyEmpty } from '../../shared/actions/automations/click/mouse-click-strategy-base';

const { nativeMethods, Promise, utils: { browser, featureDetection, extend } } = hammerhead;


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,

    dom, position, style, event, browser, featureDetection,
    utils:                       { extend },
    // NOTE: this functions are unnecessary in the core
    getElementExceptUI:          () => Promise.resolve(),
    scroll:                      () => Promise.resolve(),
    createEventSequence:         () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
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
