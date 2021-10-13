// @ts-ignore
import { nativeMethods, Promise } from './deps/hammerhead';
import { isDomElement } from './utils/dom';
import { SharedAdapter } from '../../shared/types';


const initializer: SharedAdapter = {
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,
    isDomElement,
};

export default initializer;
