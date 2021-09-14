// @ts-ignore
import { nativeMethods, Promise } from './deps/hammerhead';
import { SharedAdapter } from '../../shared/types';


const initializer: SharedAdapter = {
    PromiseCtor:   Promise,
    nativeMethods: nativeMethods,
};

export default initializer;
