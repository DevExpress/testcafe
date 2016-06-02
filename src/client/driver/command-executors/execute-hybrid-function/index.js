import hammerhead from '../../deps/hammerhead';
import DriverStatus from '../../status';
import Replicator from 'replicator';
import evalFunction from './eval-function';
import { UncaughtErrorInClientExecutedCode } from '../../../../errors/test-run';

const HYBRID_COMPILED_CODE = '[[hybridCompiledCode]]';

var Promise    = hammerhead.Promise;
var identityFn = val => val;

// NOTE: we will serialize replicator results
// to JSON with a command or command result.
// Therefore there is no need to do additional job here,
// so we use identity functions for serialization.
var replicator = new Replicator({
    serialize:   identityFn,
    deserialize: identityFn
});

replicator.addTransforms([
    {
        type: 'Function',

        shouldTransform (type) {
            return type === 'function';
        },

        toSerializable (fn) {
            return {
                isHybridCode: !!fn[HYBRID_COMPILED_CODE],
                fnCode:       fn[HYBRID_COMPILED_CODE] || fn.toString()
            };
        },

        fromSerializable (fnCode) {
            // NOTE: all functions that come to the client are hybrid functions
            var fn = evalFunction(fnCode);

            // NOTE: store hybrid function code to avoid recompilation
            // if it will be used later as a return value.
            fn[HYBRID_COMPILED_CODE] = fnCode;

            return fn;
        }
    }
]);

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
