// @ts-ignore
import hammerhead from './deps/hammerhead';
import { initializeAdapter } from '../../shared/adapter/index';
import * as dom from './utils/dom';
import * as position from './utils/position';
import * as style from './utils/style';


const { nativeMethods, Promise, utils: { browser } } = hammerhead;


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,

    dom, position, style, browser,

    // NOTE: this functions are unnecessary in the core
    getElementExceptUI: () => Promise.resolve(),
    scroll:             () => Promise.resolve(),
});
