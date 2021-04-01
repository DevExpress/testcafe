declare module 'replicator' {
    export interface Transform {
        type: string;
        shouldTransform (type: string, val: unknown): boolean;
        toSerializable (val: unknown): unknown;
        fromSerializable (val: unknown): unknown;
    }

    interface Replicator {
        removeTransforms(transforms: Transform | Transform[]): Replicator;
        addTransforms(transforms: Transform | Transform[]): Replicator;
        transforms: Transform[];
        decode (val: unknown): unknown;
        encode (val: unknown): string;
    }

    interface ReplicatorConstructor {
        new (): Replicator;
    }

    const Replicator: ReplicatorConstructor;

    export default Replicator;
}
