type TemplateArguments = any[];

interface ScreenshotOptionValue {
    path: string;
    takeOnFails?: boolean;
    pathPattern?: string;
    fullPage?: boolean;
}

interface QuarantineOptionValue {
    attemptLimit?: number;
    successThreshold?: number;
}

type OptionValue = undefined | null | string | boolean | number | string[] | Function | { [key: string]: any } | ScreenshotOptionValue | QuarantineOptionValue | CompilerOptions;
