export default class ObservedCallsitesStorage {
    public callsitesWithoutAwait: Set<Record<string, any>>;
    public snapshotPropertyCallsites: Map<string, Record<string, any>>;
    public unawaitedSnapshotCallsites: Set<Record<string, any>>;

    public constructor () {
        this.callsitesWithoutAwait      = new Set();
        this.snapshotPropertyCallsites  = new Map();
        this.unawaitedSnapshotCallsites = new Set();
    }

    public clear (): void {
        this.callsitesWithoutAwait      = new Set();
        this.snapshotPropertyCallsites  = new Map();
        this.unawaitedSnapshotCallsites = new Set();
    }
}
