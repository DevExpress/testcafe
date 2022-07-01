import { ServerNode } from './types';
import { ScrollOptions } from '../../../../../../test-run/commands/options';
import { initializeAdapter } from '../../../../../../shared/adapter';
import * as domUtils from './utils/dom-utils';
import * as positionUtils from './utils/position-utils';
import * as styleUtils from './utils/style-utils';
import * as eventUtils from './utils/event-utils';
import createMouseClickStrategy from './automations/click/create-mouse-click-strategy';


initializeAdapter({
    PromiseCtor: Promise,

    nativeMethods: {
        setTimeout,
        clearTimeout,
        arrayIndexOf: Array.prototype.indexOf,
        arraySplice:  Array.prototype.splice,
        arraySlice:   Array.prototype.slice,
        arrayFilter:  Array.prototype.filter,
        objectAssign: Object.assign,
        objectKeys:   Object.keys,
        dateNow:      Date.now,
    },

    createEventSequence: (dragAndDropEnabled: boolean, firstMovingStepOccured: boolean, options: any) => { // eslint-disable-line
        return true;
    },

    scroll: async (el: ServerNode, opts: ScrollOptions) => { // eslint-disable-line
        return true;
    },

    browser: { isChrome: true },

    featureDetection: {
        isTouchDevice: false,
    },

    utils: {
        extend (target: Record<string, any>, ...args): Record<string, any> {
            return Object.assign(target, ...args);
        },
    },

    sendRequestToFrame: () => { },

    getElementExceptUI: positionUtils.getElementFromPoint,
    dom:                domUtils,
    position:           positionUtils,
    style:              styleUtils,
    event:              eventUtils,

    ensureMouseEventAfterScroll: () => Promise.resolve(),

    automations: {
        click: {
            createMouseClickStrategy,
        },

        _ensureWindowAndCursorForLegacyTests () { // eslint-disable-line no-empty-function
        },
    },
});
