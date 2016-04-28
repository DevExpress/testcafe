import hammerhead from '../deps/hammerhead';
import DriverStatus from '../status';
import { UncaughtErrorInClientExecutedCode } from '../../../errors/test-run';

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
        .then(fn => fn.apply(window, command.args))
        .then(result => new DriverStatus({ isCommandResult: true, result }))
        .catch(err => new DriverStatus({
            isCommandResult: true,
            executionError:  new UncaughtErrorInClientExecutedCode(err)
        }));
}
