import hammerhead from '../../deps/hammerhead';
import DriverStatus from '../../status';
import replicator from './replicator';
import evalFunction from './eval-function';
import { UncaughtErrorInClientExecutedCode } from '../../../../errors/test-run';

var Promise = hammerhead.Promise;

export default function executeHybridFunction (command) {
    return Promise.resolve()
        .then(() => evalFunction(command.fnCode))
        .then(fn => {
            var args = replicator.decode(command.args);

            return fn.apply(window, args);
        })
        .then(result => new DriverStatus({
            isCommandResult: true,
            result:          replicator.encode(result)
        }))
        .catch(err => new DriverStatus({
            isCommandResult: true,
            executionError:  new UncaughtErrorInClientExecutedCode(err)
        }));
}
