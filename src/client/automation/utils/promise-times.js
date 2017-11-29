import { Promise } from '../deps/hammerhead';


export default function (n, iterator) {
    let promise = Promise.resolve();

    for (let i = 0; i < n; i++)
        promise = promise.then(() => iterator(i));

    return promise;
}
