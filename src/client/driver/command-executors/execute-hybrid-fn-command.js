import hammerhead from '../deps/hammerhead';

var Promise = hammerhead.Promise;

export default function executeHybridFnCommand (command) {
    return new Promise(resolve => {
        try {
            /* eslint-disable no-eval */
            var fn = eval(command.fnCode);
            /* eslint-enable no-eval */

            var fnResult = fn.apply(window, command.args);

            resolve({ failed: false, fnResult });
        }
        catch (err) {
            // TODO proper error handling
            resolve({ failed: false, fnResult: err.message });
        }
    });
}
