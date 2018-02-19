import hammerhead from '../deps/hammerhead';
import { reduce } from './array';

var Promise = hammerhead.Promise;


export function whilst (condition, iterator) {
    return new Promise((resolve, reject) => {
        function iterate () {
            if (condition())
                return iterator().then(iterate).catch(err => reject(err));

            return resolve();
        }

        return iterate();
    });
}

export function times (n, iterator) {
    let promise = Promise.resolve();

    for (let i = 0; i < n; i++)
        promise = promise.then(() => iterator(i));

    return promise;
}

export function each (items, iterator) {
    return reduce(items, (promise, item) => promise.then(() => iterator(item)), Promise.resolve());
}
