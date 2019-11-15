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
    [key: string]: T;
}

export interface RunnerRunOptions {
    skipJsErrors?: boolean;
    skipUncaughtErrors?: boolean;
    quarantineMode?: boolean;
    debugMode?: boolean;
    debugOnFail?: boolean;
    selectorTimeout?: number;
    assertionTimeout?: number;
    pageLoadTimeout?: number;
    speed?: number;
    stopOnFirstFail?: number;
    allowMultipleWindows: boolean;
}

export interface GetOptionConfiguration {
    optionsSeparator?: string;
    keyValueSeparator?: string;
    skipOptionValueTypeConversion?: boolean;
    onOptionParsed?: Function;
}

