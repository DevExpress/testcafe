import { CallsiteRecord } from 'callsite-record';

export default class ObservedCallsitesStorage {
    public callsitesWithoutAwait: Set<Record<string, any>>;
    public unawaitedSnapshotCallsites: Set<Record<string, any>>;
    public snapshotPropertyCallsites: Record<string, SnapshotPropertyCallsite>;
    public awaitedSnapshotWarnings: Map<string, Record<string, CallsiteRecord>>;

    public constructor () {
        this.callsitesWithoutAwait      = new Set();
        this.unawaitedSnapshotCallsites = new Set();
        this.snapshotPropertyCallsites  = {};
        this.awaitedSnapshotWarnings    = new Map();
    }

    public clear (): void {
        this.callsitesWithoutAwait      = new Set();
        this.unawaitedSnapshotCallsites = new Set();
        this.snapshotPropertyCallsites  = {};
        this.awaitedSnapshotWarnings    = new Map();
    }
}

interface SnapshotPropertyCallsite {
    callsites: CallsiteRecord[];
    asserted: boolean;
}
