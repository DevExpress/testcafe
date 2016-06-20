import Replicator from 'replicator';
import evalFunction from './eval-function';
import { NodeSnapshot, ElementSnapshot } from './node-snapshots';
import { DomNodeClientFunctionResultError } from '../../../../errors/test-run';

// NOTE: save original ctors because they may be overwritten by page code
var Node     = window.Node;
var identity = val => val;

export function createReplicator (transforms) {
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

export class FunctionTransform {
    constructor () {
        this.type = 'Function';
    }

    shouldTransform (type) {
        return type === 'function';
    }

    toSerializable () {
        return '';
    }

    fromSerializable ({ fnCode, env }) {
        return evalFunction(fnCode, env);
    }
}

export class SelectorNodeTransform {
    constructor () {
        this.type = 'Node';
    }

    shouldTransform (type, val) {
        return val instanceof Node;
    }

    toSerializable (node) {
        return node.nodeType === 1 ? new ElementSnapshot(node) : new NodeSnapshot(node);
    }
}

export class ClientFunctionNodeTransform {
    constructor (instantiationCallsiteName) {
        this.type                      = 'Node';
        this.instantiationCallsiteName = instantiationCallsiteName;
    }

    shouldTransform (type, val) {
        if (val instanceof Node)
            throw new DomNodeClientFunctionResultError(this.instantiationCallsiteName);
    }
}
