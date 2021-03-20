type TemplateArguments = any[];

interface ScreenshotOptionValue {
    path: string;
    takeOnFails?: boolean;
    pathPattern?: string;
    fullPage?: boolean;
}

interface CompilerOptions {
    [key: string]: object;
}

interface QuarantineOptionValue {
    retryCount?: number;
    passCount?: number;
}

type OptionValue = undefined | null | string | boolean | number | string[] | Function | { [key: string]: any } | ScreenshotOptionValue | CompilerOptions;
