import { identity } from 'lodash';
import Replicator from 'replicator';

// NOTE: we will serialize replicator results
// to JSON with a command or command result.
// Therefore there is no need to do additional job here,
// so we use identity functions for serialization.
export default new Replicator({
    serialize:   identity,
    deserialize: identity
});
