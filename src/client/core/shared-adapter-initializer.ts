// @ts-ignore
import hammerhead from './deps/hammerhead';
import { initializeAdapter } from '../../shared/adapter/index';
import * as dom from './utils/dom';
import * as position from './utils/position';


const { nativeMethods, Promise, utils: { browser } } = hammerhead;


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,

    dom, position, browser,

    // NOTE: this functions are unnecessary in the core
    getElementExceptUI: () => Promise.resolve(),
    scroll:             () => Promise.resolve(),
});
