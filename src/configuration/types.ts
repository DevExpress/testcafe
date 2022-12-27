const RequestHook = require('../api/request-hooks/hook');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TemplateArguments = any[];

interface ScreenshotOptionValue {
    path: string;
    takeOnFails?: boolean;
    pathPattern?: string;
    fullPage?: boolean;
    thumbnails?: boolean;
    autoTakeOnFails?: boolean;
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

interface GlobalHooks {
    testRun?: TestingEntryHooks;
    fixture?: TestingEntryHooks;
    test?: TestingEntryHooks;
    request?: typeof RequestHook[] | typeof RequestHook;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OptionValue = undefined | null | string | boolean | number | string[] | Function | { [key: string]: any } | ScreenshotOptionValue | QuarantineOptionValue | CompilerOptions | GlobalHooks | SkipJsErrorsOptionValue | CustomActions;
