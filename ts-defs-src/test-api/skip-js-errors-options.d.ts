// SkipJsErrors API
//----------------------------------------------------------------------------------------------------------------------

interface SkipJsErrorsOptions {
    message?: string | RegExp;
    stack?: string | RegExp;
    pageUrl?: string | RegExp
}
