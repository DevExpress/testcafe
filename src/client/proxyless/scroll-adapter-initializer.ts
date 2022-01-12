import nativeMethods from './native-methods';
import { initializeAdapter } from '../core/scroll/adapter/index';


initializeAdapter({
    PromiseCtor: nativeMethods.Promise,

    controller: {
        waitForScroll (): Promise<any> {
            const result = nativeMethods.Promise.resolve();

            // @ts-ignore
            result.cancel = () => {};

            return result;
        },
    },
});
