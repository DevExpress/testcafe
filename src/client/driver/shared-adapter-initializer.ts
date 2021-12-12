import hammerhead from './deps/hammerhead';
import testCafeAutomation from './deps/testcafe-automation';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';


const { nativeMethods, Promise, utils: { browser } } = hammerhead;
const { domUtils: dom, positionUtils: position, styleUtils: style } = testCafeCore;
const { getOffsetOptions } = testCafeAutomation;


initializeAdapter({
    PromiseCtor:      Promise,
    nativeMethods:    nativeMethods,
    getOffsetOptions: getOffsetOptions,

    dom, position, style, browser,

    // NOTE: this functions are unnecessary in the driver
    getElementExceptUI: () => Promise.resolve(),
    scroll:             () => Promise.resolve(),
});
