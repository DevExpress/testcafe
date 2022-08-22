// SkipJsErrors API
//----------------------------------------------------------------------------------------------------------------------

type SkipJsErrorsCallback = (opts?: {message: string; stack: string; pageUrl: string }) => boolean;

interface SkipJsErrorsCallbackWithOptionsObject {
    fn: SkipJsErrorsCallback;
    dependencies?: { [key: string]: any };
}

interface SkipJsErrorsOptionsObject {
    message?: string | RegExp;
    stack?: string | RegExp;
    pageUrl?: string | RegExp;
}
