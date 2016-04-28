import hammerhead from '../deps/hammerhead';
import DriverStatus from '../status';

var Promise = hammerhead.Promise;

export default function executeHybridFnCommand (command) {
    return Promise.resolve()
        .then(() => {
            // NOTE: `eval` in strict mode will not override context variables
            'use strict';
            /* eslint-disable no-eval */
            return eval(command.fnCode);
            /* eslint-enable no-eval */
        })
        .then(fn => {
            return fn.apply(window, command.args);
        })
        .then(result => {
            return new DriverStatus({ isCommandResult: true, result });
        })
        .catch(err => {
            return new DriverStatus({ isCommandResult: true, result: err.message });
        });
}
