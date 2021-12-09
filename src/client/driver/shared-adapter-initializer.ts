// @ts-ignore
import hammerhead from './deps/hammerhead';
// @ts-ignore
import { getOffsetOptions } from './deps/testcafe-automation';
// @ts-ignore
import { domUtils as dom, positionUtils as position } from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';

const { nativeMethods, Promise, utils: { browser } } = hammerhead;

initializeAdapter({
    PromiseCtor:      Promise,
    nativeMethods:    nativeMethods,
    getOffsetOptions: getOffsetOptions,

    dom, position, browser,

    // NOTE: this functions are unnecessary in the driver
    getElementExceptUI: () => Promise.resolve(),
    scroll:             () => Promise.resolve(),
});
