
// Request Hook
//----------------------------------------------------------------------------------------------------------------------

interface RequestHook {
    /**
     * The `onRequest` method is called before sending the request.
     */
    onRequest(requestEvent: object): Promise<void>;

    /**
     * The `onResponse` method is called after sending the request
     */
    onResponse(responseEvent: object): Promise<void>;
}


interface RequestHookConstructor {
    /**
     * Creates a request hook
     * @param requestFilterRules - determines which requests the hook handles
     * @param responseEventConfigureOpts - defines whether to pass the response headers and body to the onResponse method
     * @returns {RequestHook}
     */
    new (requestFilterRules?: Array<any>, responseEventConfigureOpts?: object): RequestHook;
}

// Request Logger
//----------------------------------------------------------------------------------------------------------------------

interface RequestLoggerOptions {
    /**
     *  Specifies whether the request headers should be logged.
     */
    logRequestHeaders?: boolean;
    /**
     * Specifies whether the request body should be logged.
     */
    logRequestBody?: boolean;
    /**
     * Specifies whether the request body should be stored as a String or a Buffer.
     */
    stringifyRequestBody?: boolean;
    /**
     * Specifies whether the response headers should be logged.
     */
    logResponseHeaders?: boolean;
    /**
     * Specifies whether the response body should be logged.
     */
    logResponseBody?: boolean;
    /**
     * Specifies whether the response body should be stored as a string or a Buffer.
     */
    stringifyResponseBody?: boolean;
}

interface LoggedRequest {
    /**
     * The user agent that sent the request.
     */
    userAgent: string;
    /**
     * The request part of the logged request
     */
    request: RequestData;
    /**
     * The response part of the logged request
     */
    response: ResponseData;
}

interface RequestData {
    /**
     * The URL where the request is sent.
     */
    url: string;
    /**
     * The request's HTTP method.
     */
    method: string;
    /**
     * Request headers in the property-value form. Logged if the `logRequestHeaders` option is set to `true`.
     */
    headers: object;
    /**
     * The response body. Logged if the `logResponseBody` option is set to `true`.
     * A [Buffer](https://nodejs.org/api/buffer.html) or string depending on the `stringifyResponseBody` option.
     */
    body: string | any;
    /**
     * The timestamp that specifies when the request was intercepted.
     */
    timestamp: number;
}

interface ResponseData {
    /**
     * The status code received in the response.
     */
    statusCode: number;
    /**
     * Response headers in the property-value form. Logged if the `logResponseHeaders` option is set to true.
     */
    headers: object;
    /**
     * The response body.
     * Logged if the `logResponseBody` option is set to true.
     * A Buffer or string depending on the `stringifyResponseBody` option.
     */
    body: string | any;
    /**
     * The timestamp that specifies when the response was intercepted.
     */
    timestamp: number;
}

interface RequestLogger extends RequestHook {
    /**
     * Returns whether the logger contains a request that matches the predicate.
     * @param predicate - The predicate
     */
    contains(predicate: (request: LoggedRequest) => boolean): Promise<boolean>;
    /**
     * Returns the number of requests that match the predicate.
     * @param predicate - The predicate
     */
    count(predicate: (request: LoggedRequest) => boolean): Promise<number>;
    /**
     * Clears all logged requests.
     */
    clear(): void;
    /**
     * Returns an array of logged requests.
     */
    requests: Array<LoggedRequest>;
}

interface RequestLoggerFactory {
    (
        filter?: string | RegExp | object | ((req: any) => boolean),
        options?: RequestLoggerOptions
    ): RequestLogger;
}

// Request Mock
//----------------------------------------------------------------------------------------------------------------------

interface RequestMock {
    /**
     * Specifies requests to intercept
     * @param filter - Specifies which requests should be mocked with a response that follows in the `respond` method.
     */
    onRequestTo(filter: string | RegExp | object | ((req: RequestOptions) => boolean)): RequestMock;
    /**
     * Specifies the mocked response.
     * @param body - The mocked response body.
     * @param statusCode - The response status code.
     * @param headers - Custom headers added to the response in the property-value form.
     */
    respond(body?: object | string | ((req: RequestOptions, res: ResponseMock) => any), statusCode?: number, headers?: object): RequestMock;
}

interface RequestMockFactory {
    (): RequestMock;
}

/**
 * {@link https://devexpress.github.io/testcafe/documentation/reference/test-api/requestmock/respond.html#requestoptions See documentation}.
 */
interface RequestOptions {
    /** The request headers in the property-value form. */
    headers: Object;
    /** The request body. */
    body: Buffer;
    /** The URL to which the request is sent. */
    url: string;
    /** The protocol to use. Default: http:. */
    protocol: string;
    /** The alias for the host. */
    hostname: string;
    /** The domain name or IP address of the server to issue the request to. Default: localhost. */
    host: string;
    /** The port of the remote server. Default: 80. */
    port: number;
    /**
     * The request path. Should include query string if any. E.G. '/index.html?page=12'. An exception
     * is thrown when the request path contains illegal characters. Currently, only spaces are
     * rejected but that may change in the future. Default: '/'.
     */
    path: string;
    /** The string specifying the HTTP request method. Default: 'GET'. */
    method: string;
    /**
     * Credentials that were used for authentication in the current session using NTLM or Basic
     * authentication. For HTTP Basic authentication, these are `username` and `password`. NTLM
     * authentication additionally specifies `workstation` and `domain`.
     * See {@link https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/authentication.html#http-authentication HTTP Authentication}.
     */
    credentials: object;
    /**
     * If a proxy is used, the property contains information about its `host`, `hostname`, `port`,
     * `proxyAuth`, `authHeader` and `bypassRules`.
     */
    proxy: object;
}

interface ResponseMock {
    headers: object;
    statusCode: number;
    setBody(value: string): void;
}
