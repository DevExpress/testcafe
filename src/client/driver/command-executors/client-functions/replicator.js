import Replicator from 'replicator';
import evalFunction from './eval-function';
import { NodeSnapshot, ElementSnapshot } from './selector-executor/node-snapshots';
import { DomNodeClientFunctionResultError, UncaughtErrorInCustomDOMPropertyCode } from '../../../../errors/test-run';
import hammerhead from '../../deps/hammerhead';

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

    fromSerializable ({ fnCode, dependencies }) {
        return evalFunction(fnCode, dependencies);
    }
}

export class SelectorNodeTransform {
    constructor (customDOMProperties) {
        this.type                = 'Node';
        this.customDOMProperties = customDOMProperties || {};
    }

    _extend (snapshot, node) {
        hammerhead.nativeMethods.objectKeys.call(window.Object, this.customDOMProperties).forEach(prop => {
            try {
                snapshot[prop] = this.customDOMProperties[prop](node);
            }
            catch (err) {
                throw new UncaughtErrorInCustomDOMPropertyCode(this.instantiationCallsiteName, err, prop);
            }
        });
    }

    shouldTransform (type, val) {
        return val instanceof Node;
    }

    toSerializable (node) {
        var snapshot = node.nodeType === 1 ? new ElementSnapshot(node) : new NodeSnapshot(node);

        this._extend(snapshot, node);

        return snapshot;
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
