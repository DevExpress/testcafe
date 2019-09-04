export interface FilterOption {
    testGrep?: string | RegExp | undefined;
    fixtureGrep?: string | RegExp | undefined;
}

export interface ReporterOption {
    name: string;
    output? : string | Buffer;
}

export interface StaticContentCachingOptions {
    maxAge: number;
    mustRevalidate: boolean;
}

export interface Dictionary<T> {
    [Key: string]: T;
}

