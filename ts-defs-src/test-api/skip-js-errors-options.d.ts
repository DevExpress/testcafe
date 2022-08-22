// SkipJsErrors API
//----------------------------------------------------------------------------------------------------------------------

type SkipJsErrorsCallback = (opts?: {message: string; stack: string; pageUrl: string }) => boolean;

interface SkipJsErrorsCallbackOptions {
    fn: SkipJsErrorsCallback;
    dependencies?: { [key: string]: any };
}

interface SkipJsErrorsOptions {
    message?: string | RegExp;
    stack?: string | RegExp;
    pageUrl?: string | RegExp;
}
