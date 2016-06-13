import hammerhead from '../../deps/hammerhead';
import DriverStatus from '../../status';
import Replicator from 'replicator';
import evalFunction from './eval-function';
import { NodeSnapshot, ElementSnapshot } from './node-snapshots';
import { UncaughtErrorInClientFunctionCode, DomNodeHybridResultError } from '../../../../errors/test-run';

// NOTE: save original ctors because they may be overwritten by page code
var Node       = window.Node;
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

    toSerializable () {
        return '';
    },

    fromSerializable (fnCode) {
        return evalFunction(fnCode);
    }
};

var nodeTransformForHybrid = {
    type: 'Node',

    shouldTransform (type, val) {
        if (val instanceof Node)
            throw new DomNodeHybridResultError();
    }
};

var nodeTransformForSelector = {
    type: 'Node',

    shouldTransform (type, val) {
        return val instanceof Node;
    },

    toSerializable (node) {
        return node.nodeType === 1 ? new ElementSnapshot(node) : new NodeSnapshot(node);
    }
};

var replicatorForHybrid   = createReplicator([functionTransform, nodeTransformForHybrid]);
var replicatorForSelector = createReplicator([functionTransform, nodeTransformForSelector]);

export default function executeHybridFunction (command) {
    var replicator = command.isSelector ? replicatorForSelector : replicatorForHybrid;

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
