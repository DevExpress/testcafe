import nativeMethods from './native-methods';
import { initializeAdapter } from '../core/scroll/adapter/index';


initializeAdapter({
    PromiseCtor: nativeMethods.Promise,

    controller: {
        waitForScroll (): Promise<any> {
            return nativeMethods.Promise.resolve();
        },
    },
});
