import hammerhead from '../deps/hammerhead';

var Promise       = hammerhead.Promise;
var nativeMethods = hammerhead.nativeMethods;


export default function (fn, delay, timeout) {
    return new Promise((resolve, reject) => {
        var result = fn();

        if (result) {
            resolve(result);
            return;
        }

        var intervalId = nativeMethods.setInterval.call(window, () => {
            result = fn();

            if (result) {
                window.clearInterval(intervalId);
                window.clearTimeout(timeoutId);
                resolve(result);
            }
        }, delay);

        var timeoutId = nativeMethods.setTimeout.call(window, () => {
            window.clearInterval(intervalId);
            reject();
        }, timeout);
    });
}
