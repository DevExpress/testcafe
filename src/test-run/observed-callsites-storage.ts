export default class ObservedCallsitesStorage {
    public callsitesWithoutAwait: Set<Object>;
    public snapshotPropertyCallsites: Set<Object>;

    constructor () {
        this.callsitesWithoutAwait     = new Set();
        this.snapshotPropertyCallsites = new Set();
    }

    public clear (): void {
        this.callsitesWithoutAwait     = new Set();
        this.snapshotPropertyCallsites = new Set();
    }
}