export interface RequestHookLogOptions {
    logRequestHeaders: boolean;
    logRequestBody: boolean;
    stringifyRequestBody: boolean;
    logResponseHeaders: boolean;
    logResponseBody: boolean;
    stringifyResponseBody: boolean;
}

export type RequestHookLogOptionsInit = Partial<RequestHookLogOptions>;
