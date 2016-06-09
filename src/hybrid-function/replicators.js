import { identity } from 'lodash';
import Replicator from 'replicator';
import { compiledCodeSymbol, DEFAULT_EXECUTION_CALLSITE_NAME } from './common';
import { compileFunctionArgumentOfHybridFunction } from '../compiler/es-next/hybrid-function';

function createReplicator (transforms) {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    var replicator = new Replicator({
        serialize:   identity,
        deserialize: identity
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
        var isHybrid = !!fn[compiledCodeSymbol];

        if (isHybrid)
            return fn[compiledCodeSymbol];

        return compileFunctionArgumentOfHybridFunction(fn.toString(), DEFAULT_EXECUTION_CALLSITE_NAME);
    },

    fromSerializable () {
        return void 0;
    }
};

var nodeTransform = {
    type: 'Node',

    shouldTransform () {
        return false;
    },

    fromSerializable: identity
};

// Replicators
export var replicatorForHybrid   = createReplicator([functionTransform]);
export var replicatorForSelector = createReplicator([functionTransform, nodeTransform]);
