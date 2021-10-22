type TemplateArguments = any[];

interface ScreenshotOptionValue {
    path: string;
    takeOnFails?: boolean;
    pathPattern?: string;
    fullPage?: boolean;
    thumbnails?: boolean;
}

interface QuarantineOptionValue {
    attemptLimit?: number;
    successThreshold?: number;
}

interface TestingEntryHooks {
    before?: Function;
    after?: Function;
}

interface GlobalHooks {
    testRun?: TestingEntryHooks;
    fixture?: TestingEntryHooks;
    test?: TestingEntryHooks;
}

type OptionValue = undefined | null | string | boolean | number | string[] | Function | { [key: string]: any } | ScreenshotOptionValue | QuarantineOptionValue | CompilerOptions | GlobalHooks;
