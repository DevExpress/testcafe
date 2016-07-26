import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var Promise    = hammerhead.Promise;
var arrayUtils = testCafeCore.arrayUtils;


export default function (items, iterator) {
    return arrayUtils
        .reduce(items, (promise, item) => promise.then(() => iterator(item)), Promise.resolve());
}
