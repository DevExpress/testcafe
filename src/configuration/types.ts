// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TemplateArguments = any[];

interface ScreenshotOptionValue {
    path: string;
    takeOnFails?: boolean;
    pathPattern?: string;
    pathPatternOnFails?: string;
    fullPage?: boolean;
    thumbnails?: boolean;
}

interface QuarantineOptionValue {
    attemptLimit?: number;
    successThreshold?: number;
}

type SkipJsErrorsOptionValue = SkipJsErrorsOptionsObject | boolean;

interface TestingEntryHooks {
    before?: Function;
    after?: Function;
}

interface ReporterHooks {
    onBeforeWrite?: { [reporterName: string]: Function }
}

interface GlobalHooks {
    testRun?: TestingEntryHooks;
    fixture?: TestingEntryHooks;
    test?: TestingEntryHooks;
    request?: import('../api/request-hooks/hook').default[] | import('../api/request-hooks/hook').default;
    reporter?: ReporterHooks
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OptionValue = undefined | null | string | boolean | number | string[] | Function | { [key: string]: any } | ScreenshotOptionValue | QuarantineOptionValue | CompilerOptions | GlobalHooks | SkipJsErrorsOptionValue | CustomActions;
