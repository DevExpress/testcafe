// SkipJsErrors API
//----------------------------------------------------------------------------------------------------------------------

type SkipJsErrorsHandler = (opts: {message: string, stack: string, pageUrl:string }) => boolean;

interface SkipJsErrorsOptions {
    message?: string | RegExp;
    stack?: string | RegExp;
    pageUrl?: string | RegExp
}
