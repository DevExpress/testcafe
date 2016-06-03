import hammerhead from '../../deps/hammerhead';
import DriverStatus from '../../status';
import Replicator from 'replicator';
import evalFunction from './eval-function';
import { UncaughtErrorInClientExecutedCode, DomNodeHybridResultError } from '../../../../errors/test-run';

const HYBRID_COMPILED_CODE = '[[hybridCompiledCode]]';

// NOTE: save original ctors because they may be overwritten by use code
var Node = window.Node;

var Promise    = hammerhead.Promise;
var identityFn = val => val;

function createReplicator (transforms) {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    var replicator = new Replicator({
        serialize:   identityFn,
        deserialize: identityFn
    });

    return replicator.addTransforms(transforms);
}

// Replicator transforms
var functionTransform = {
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
};

var nodeTransformForHybrid = {
    type: 'Node',

    shouldTransform (type, val) {
        if (val instanceof Node)
            throw new DomNodeHybridResultError();
    }
};

var replicatorForHybrid = createReplicator([functionTransform, nodeTransformForHybrid]);

export default function executeHybridFunction (command) {
    return Promise.resolve()
        .then(() => evalFunction(command.fnCode))
        .then(fn => {
            var args = replicatorForHybrid.decode(command.args);

            return fn.apply(window, args);
        })
        .then(result => new DriverStatus({
            isCommandResult: true,
            result:          replicatorForHybrid.encode(result)
        }))
        .catch(err => {
            if (!err.isTestCafeError)
                err = new UncaughtErrorInClientExecutedCode(err);

            return new DriverStatus({
                isCommandResult: true,
                executionError:  err
            });
        });
}
