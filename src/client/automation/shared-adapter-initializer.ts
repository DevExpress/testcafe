import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';
import { ScrollOptions } from '../../test-run/commands/options';
import { getOffsetOptions } from './utils/offsets';

const { nativeMethods, Promise } = hammerhead;
const { domUtils, ScrollAutomation } = testCafeCore;


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,
    scroll:        (el: any, scrollOptions: ScrollOptions) => new ScrollAutomation(el, scrollOptions).run(),

    getOffsetOptions: getOffsetOptions,
    isDomElement:     domUtils.isDomElement,
});
