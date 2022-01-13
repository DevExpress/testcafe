import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';
import { ScrollOptions } from '../../test-run/commands/options';
import getElementExceptUI from './utils/get-element-except-ui';
import createEventSequence from './playback/move/event-sequence/create-event-sequence';


const { nativeMethods, Promise, utils: { browser, featureDetection } } = hammerhead;
const { domUtils: dom, positionUtils: position, ScrollAutomation, styleUtils: style, eventUtils: event } = testCafeCore;

initializeAdapter({
    PromiseCtor:        Promise,
    nativeMethods:      nativeMethods,
    scroll:             (el: any, scrollOptions: ScrollOptions) => new ScrollAutomation(el, scrollOptions).run(),
    getElementExceptUI: getElementExceptUI,
    dom, position, style, event, browser, featureDetection,
    createEventSequence,
    sendRequestToFrame: testCafeCore.sendRequestToFrame,
});
