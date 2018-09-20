import hammerhead from '../deps/hammerhead';

const Promise       = hammerhead.Promise;
const nativeMethods = hammerhead.nativeMethods;


export default function (fn, delay, timeout) {
    return new Promise((resolve, reject) => {
        let result = fn();

        if (result) {
            resolve(result);
            return;
        }

        const intervalId = nativeMethods.setInterval.call(window, () => {
            result = fn();

            if (result) {
                nativeMethods.clearInterval.call(window, intervalId);
                nativeMethods.clearTimeout.call(window, timeoutId);
                resolve(result);
            }
        }, delay);

        const timeoutId = nativeMethods.setTimeout.call(window, () => {
            nativeMethods.clearInterval.call(window, intervalId);
            reject();
        }, timeout);
    });
}
