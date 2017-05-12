import { identity } from 'lodash';
import Replicator from 'replicator';
import functionBuilderSymbol from './builder-symbol';
import compileClientFunction from '../compiler/compile-client-function';

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

// Replicator transforms
export class FunctionTransform {
    constructor (callsiteNames) {
        this.type          = 'Function';
        this.callsiteNames = callsiteNames;
    }

    shouldTransform (type) {
        return type === 'function';
    }

    toSerializable (fn) {
        var clientFnBuilder = fn[functionBuilderSymbol];

        if (clientFnBuilder) {
            return {
                fnCode:       clientFnBuilder.compiledFnCode,
                dependencies: clientFnBuilder.getFunctionDependencies()
            };
        }

        return {
            fnCode:       compileClientFunction(fn.toString(), null, this.callsiteNames.instantiation, this.callsiteNames.execution),
            dependencies: {}
        };
    }

    fromSerializable () {
        return void 0;
    }
}

export class SelectorNodeTransform {
    constructor () {
        this.type = 'Node';
    }

    shouldTransform () {
        return false;
    }

    fromSerializable (nodeSnapshot) {
        return nodeSnapshot;
    }
}
