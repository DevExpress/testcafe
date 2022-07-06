import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';
import { ScrollOptions } from '../../test-run/commands/options';
import getElementExceptUI from './utils/get-element-except-ui';
import ensureMouseEventAfterScroll from './utils/ensure-mouse-event-after-scroll';
import createEventSequence from './playback/move/event-sequence/create-event-sequence';
import { createMouseClickStrategy } from './playback/click/browser-click-strategy';
import cursor from './cursor';


const { utils: { featureDetection } } = hammerhead;
const { domUtils: dom, positionUtils: position, ScrollAutomation, styleUtils: style, eventUtils: event } = testCafeCore;

initializeAdapter({
    scroll:             (el: any, scrollOptions: ScrollOptions) => new ScrollAutomation(el, scrollOptions).run(),
    getElementExceptUI: getElementExceptUI,
    dom, position, style, event, featureDetection,
    createEventSequence,
    sendRequestToFrame: testCafeCore.sendRequestToFrame,
    ensureMouseEventAfterScroll,

    automations: {
        click: {
            createMouseClickStrategy,
        },

        _ensureWindowAndCursorForLegacyTests (automation) {
            automation.window = automation.window || window;
            automation.cursor = cursor;
        },
    },
});
