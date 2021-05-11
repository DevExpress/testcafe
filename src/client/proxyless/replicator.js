import Replicator from 'replicator';
import evalFunction from './eval-function';
import { DomNodeClientFunctionResultError } from '../../shared/errors';

const identity = val => val;


export function createReplicator (transforms) {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    const replicator = new Replicator({
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

    // HACK: UglifyJS + TypeScript + argument destructuring can generate incorrect code.
    // So we have to use plain assignments here.
    fromSerializable (opts) {
        const fnCode       = opts.fnCode;
        const dependencies = opts.dependencies;

        return evalFunction(fnCode, dependencies);
    }
}

export class ClientFunctionNodeTransform {
    constructor (instantiationCallsiteName) {
        this.type                      = 'Node';
        this.instantiationCallsiteName = instantiationCallsiteName;
    }

    shouldTransform (type, val) {
        if (val instanceof Node)
            throw DomNodeClientFunctionResultError.name;
    }
}
