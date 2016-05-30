import { identity } from 'lodash';
import Replicator from 'replicator';
import hybridCompiledCode from './compiled-code-symbol';
import { compileFunctionArgumentOfHybridFunction } from '../../../compiler/es-next/hybrid-function';

// NOTE: we will serialize replicator results
// to JSON with a command or command result.
// Therefore there is no need to do additional job here,
// so we use identity functions for serialization.
var replicator = new Replicator({
    serialize:   identity,
    deserialize: identity
});

export default replicator.addTransforms([
    {
        type: 'Function',

        shouldTransform (type) {
            return type === 'function';
        },

        toSerializable (fn) {
            if (fn[hybridCompiledCode])
                return fn[hybridCompiledCode];

            var code = fn.toString();

            return compileFunctionArgumentOfHybridFunction(code);
        }
    }
]);


