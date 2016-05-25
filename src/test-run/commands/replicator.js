// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import Replicator from 'replicator';

var identityFn = val => val;

// NOTE: we will serialize replicator results
// to JSON with command or command result.
// Therefore there is no need to do additional job here,
// so we use identity functions for serialization.
export default new Replicator({
    serialize:   identityFn,
    deserialize: identityFn
});
