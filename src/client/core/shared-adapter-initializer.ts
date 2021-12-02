// @ts-ignore
import { nativeMethods, Promise } from './deps/hammerhead';
import { isDomElement } from './utils/dom';
import { initializeAdapter } from '../../shared/adapter/index';


initializeAdapter({
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,
    scroll:        () => Promise.resolve(),
    isDomElement,
});
