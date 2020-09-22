export default class ObservedCallsitesStorage {
    public callsitesWithoutAwait: Set<Record<string, any>>;
    public snapshotPropertyCallsites: {
        thenSet: Set<Record<string, any>>;
        expectSet: Set<Record<string, any>>;
        callsitesToWarn: Record<string, any>[];
    };
    public unawaitedSnapshotCallsites: Set<Record<string, any>>;

    public constructor () {
        this.callsitesWithoutAwait      = new Set();
        this.snapshotPropertyCallsites  = {
            thenSet:         new Set(),
            expectSet:       new Set(),
            callsitesToWarn: []
        };
        this.unawaitedSnapshotCallsites = new Set();
    }

    public clear (): void {
        this.callsitesWithoutAwait     = new Set();
        this.snapshotPropertyCallsites = {
            thenSet:         new Set(),
            expectSet:       new Set(),
            callsitesToWarn: []
        };
        this.unawaitedSnapshotCallsites = new Set();
    }
}
