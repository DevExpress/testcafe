import hammerhead from './deps/hammerhead';
import testCafeAutomation from './deps/testcafe-automation';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';


const { nativeMethods, Promise, utils: { browser, featureDetection } } = hammerhead;
const { domUtils: dom, positionUtils: position, styleUtils: style, eventUtils: event } = testCafeCore;
const { getOffsetOptions } = testCafeAutomation;


initializeAdapter({
    PromiseCtor:      Promise,
    nativeMethods:    nativeMethods,
    getOffsetOptions: getOffsetOptions,

    dom, position, style, event, browser, featureDetection,

    // NOTE: this functions are unnecessary in the driver
    getElementExceptUI:  () => Promise.resolve(),
    scroll:              () => Promise.resolve(),
    createEventSequence: () => {},
    sendRequestToFrame:  () => Promise.resolve(),
});
