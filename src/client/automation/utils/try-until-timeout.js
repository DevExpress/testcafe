import { Promise, nativeMethods } from '../deps/hammerhead';
import { delay } from '../deps/testcafe-core';

export default function tryUntilTimeout (fn, timeout, interval) {
    return new Promise((resolve, reject) => {
        var timeoutExpired = false;

        delay(timeout).then(() => {
            timeoutExpired = true;
        });

        function runFn () {
            fn()
                .then(resolve)
                .catch(err => {
                    if (timeoutExpired)
                        reject(err);
                    else
                        nativeMethods.setTimeout.call(window, runFn, interval);
                });
        }

        runFn();
    });
}
