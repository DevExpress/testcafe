import { Promise } from '../../deps/hammerhead';
import DriverStatus from '../../status';
import { createReplicator, FunctionTransform, SelectorNodeTransform, ClientFunctionNodeTransform } from './replicator';
import evalFunction from './eval-function';
import { UncaughtErrorInClientFunctionCode } from '../../../../errors/test-run';

function createReplicatorForClientFunction (command) {
    return createReplicator([
        new ClientFunctionNodeTransform(command.instantiationCallsiteName),
        new FunctionTransform()
    ]);
}

function createReplicatorForSelector () {
    return createReplicator([
        new SelectorNodeTransform(),
        new FunctionTransform()
    ]);
}

export default function executeClientFunction (command) {
    var replicator = command.isSelector ? createReplicatorForSelector() : createReplicatorForClientFunction(command);

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
        .catch(err => {
            if (!err.isTestCafeError)
                err = new UncaughtErrorInClientFunctionCode(command.instantiationCallsiteName, err);

            return new DriverStatus({
                isCommandResult: true,
                executionError:  err
            });
        });
}
