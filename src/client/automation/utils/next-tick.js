import hammerhead from '../deps/hammerhead';

var Promise = hammerhead.Promise;
var nativeMethods  = hammerhead.nativeMethods;


export default function () {
    return new Promise(resolve => nativeMethods.setTimeout.call(window, resolve, 0));
}
