import hammerhead from '../deps/hammerhead';

var Promise = hammerhead.Promise;


export default function (condition, iterator) {
    return new Promise(resolve => {
        function iterate () {
            if (condition())
                return iterator().then(iterate);

            resolve();
        }

        return iterate();
    });
}
