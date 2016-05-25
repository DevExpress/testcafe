import hammerhead from '../deps/hammerhead';
import DriverStatus from '../status';
import replicator from '../../../test-run/commands/replicator';
import { UncaughtErrorInClientExecutedCode } from '../../../errors/test-run';

var Promise = hammerhead.Promise;

export default function executeClientCode (command) {
    return Promise.resolve()
        .then(() => {
            // NOTE: `eval` in strict mode will not override context variables
            'use strict';
            /* eslint-disable no-eval */
            return eval(command.src);
            /* eslint-enable no-eval */
        })
        .then(fn => {
            var args = replicator.decode(command.args);

            return fn.apply(window, args);
        })
        .then(result => new DriverStatus({ isCommandResult: true, result }))
        .catch(err => new DriverStatus({
            isCommandResult: true,
            executionError:  new UncaughtErrorInClientExecutedCode(err)
        }));
}
