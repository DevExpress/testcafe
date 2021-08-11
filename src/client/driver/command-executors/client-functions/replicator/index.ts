import Replicator, { Transform } from 'replicator';


const identity = (val: unknown): unknown => val;

export default function createReplicator (transforms: Transform[]): Replicator {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    const replicator = new Replicator({
        serialize:   identity,
        deserialize: identity,
    });

    return replicator.addTransforms(transforms);
}
