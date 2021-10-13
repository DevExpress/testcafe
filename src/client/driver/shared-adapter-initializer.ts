// @ts-ignore
import { nativeMethods, Promise } from './deps/hammerhead';
import { SharedAdapter } from '../../shared/types';
// @ts-ignore
import { getOffsetOptions } from './deps/testcafe-automation';
// @ts-ignore
import { domUtils } from './deps/testcafe-core';


const initializer: SharedAdapter = {
    PromiseCtor:      Promise,
    nativeMethods:    nativeMethods,
    getOffsetOptions: getOffsetOptions,
    isDomElement:     domUtils.isDomElement,
};

export default initializer;
