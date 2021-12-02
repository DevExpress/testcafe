// @ts-ignore
import { nativeMethods, Promise } from './deps/hammerhead';
// @ts-ignore
import { getOffsetOptions } from './deps/testcafe-automation';
// @ts-ignore
import { domUtils } from './deps/testcafe-core';
import { initializeAdapter } from '../../shared/adapter/index';


initializeAdapter({
    PromiseCtor:      Promise,
    nativeMethods:    nativeMethods,
    scroll:           () => Promise.resolve(),
    getOffsetOptions: getOffsetOptions,
    isDomElement:     domUtils.isDomElement,
});
