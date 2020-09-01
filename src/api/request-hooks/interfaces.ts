export type RequestFilterRuleInit = unknown;

export interface RequestHookLogOptionsInit {
    logRequestHeaders?: boolean;
    logRequestBody?: boolean;
    stringifyRequestBody?: boolean;
    logResponseHeaders?: boolean;
    logResponseBody?: boolean;
    stringifyResponseBody?: boolean;
}

export interface RequestHookLogOptions {
    logRequestHeaders: boolean;
    logRequestBody: boolean;
    stringifyRequestBody: boolean;
    logResponseHeaders: boolean;
    logResponseBody: boolean;
    stringifyResponseBody: boolean;
}

