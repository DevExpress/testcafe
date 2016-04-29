import hammerhead from '../deps/hammerhead';
import DriverStatus from '../status';

var Promise = hammerhead.Promise;

export default function executeHybridFnCommand (command) {
    return new Promise(resolve => {
        try {
            /* eslint-disable no-eval */
            var fn = eval(command.fnCode);
            /* eslint-enable no-eval */

            var result = fn.apply(window, command.args);

            resolve(new DriverStatus({ isCommandResult: true, result }));
        }
        catch (err) {
            // TODO proper error handling
            resolve(new DriverStatus({ isCommandResult: true, result: err.message }));
        }
    });
}
