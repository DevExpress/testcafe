// NOTE: Chrome keys storage of all file:// pages by this origin.
const FILE_PROTOCOL_ORIGIN = 'file://';

export function getStorageOrigin (url: string): string | null {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(url);
    }
    catch {
        return null;
    }

    if (parsedUrl.protocol === 'file:')
        return FILE_PROTOCOL_ORIGIN;

    return parsedUrl.origin === 'null' ? null : parsedUrl.origin;
}

export class VisitedOrigins {
    private readonly _origins = new Set<string>();

    public track (url: string): void {
        const origin = getStorageOrigin(url);

        if (origin)
            this._origins.add(origin);
    }

    public take (): string[] {
        const origins = Array.from(this._origins);

        this._origins.clear();

        return origins;
    }

    public clear (): void {
        this._origins.clear();
    }
}
