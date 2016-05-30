import Replicator from 'replicator';
import evalFunction from './eval-function';

var identityFn = val => val;

// NOTE: we will serialize replicator results
// to JSON with a command or command result.
// Therefore there is no need to do additional job here,
// so we use identity functions for serialization.
var replicator = new Replicator({
    serialize:   identityFn,
    deserialize: identityFn
});

export default replicator.addTransforms([
    {
        type: 'Function',

        shouldTransform () {
            return false;
        },

        fromSerializable: evalFunction
    }
]);

