import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';
import getElementExceptUI from './utils/get-element-except-ui';
import { ScrollOptions } from '../../test-run/commands/options';


const { nativeMethods, Promise, utils: { browser } } = hammerhead;
const { domUtils: dom, positionUtils: position, styleUtils: style, ScrollAutomation } = testCafeCore;


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,
    scroll:        (el: any, scrollOptions: ScrollOptions) => new ScrollAutomation(el, scrollOptions).run(),

    dom, position, style, browser, getElementExceptUI,
});
