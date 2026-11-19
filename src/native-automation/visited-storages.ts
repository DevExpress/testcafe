import BrowserConnection from '../browser/connection';

interface VisitedStorages {
    origins: Set<string>;
    storageKeys: Set<string>;
}

const visitedStorages = new WeakMap<BrowserConnection, VisitedStorages>();

function getVisitedStorages (connection: BrowserConnection): VisitedStorages {
    let storages = visitedStorages.get(connection);

    if (!storages) {
        storages = { origins: new Set(), storageKeys: new Set() };

        visitedStorages.set(connection, storages);
    }

    return storages;
}

export function addVisitedOrigin (connection: BrowserConnection, url: string): void {
    if (!connection || !/^https?:/.test(url))
        return;

    try {
        getVisitedStorages(connection).origins.add(new URL(url).origin);
    }
    catch {
        return;
    }
}

export function addVisitedStorageKey (connection: BrowserConnection, storageKey: string): void {
    if (connection && storageKey)
        getVisitedStorages(connection).storageKeys.add(storageKey);
}

export function getVisitedOrigins (connection: BrowserConnection): string[] {
    return Array.from(getVisitedStorages(connection).origins);
}

export function getVisitedStorageKeys (connection: BrowserConnection): string[] {
    return Array.from(getVisitedStorages(connection).storageKeys);
}
