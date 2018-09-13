import hammerhead from '../deps/hammerhead';

const Promise       = hammerhead.Promise;
const nativeMethods = hammerhead.nativeMethods;


export default function (ms) {
    return new Promise(resolve => nativeMethods.setTimeout.call(window, resolve, ms));
}
