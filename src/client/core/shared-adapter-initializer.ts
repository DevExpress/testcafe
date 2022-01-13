// @ts-ignore
import hammerhead from './deps/hammerhead';
import { initializeAdapter } from '../../shared/adapter/index';
import * as dom from './utils/dom';
import * as position from './utils/position';
import * as style from './utils/style';
import * as event from './utils/event';


const { nativeMethods, Promise, utils: { browser, featureDetection } } = hammerhead;


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,

    dom, position, style, event, browser, featureDetection,
    // NOTE: this functions are unnecessary in the core
    getElementExceptUI:  () => Promise.resolve(),
    scroll:              () => Promise.resolve(),
    createEventSequence: () => {},
    sendRequestToFrame:  () => Promise.resolve(),
});
