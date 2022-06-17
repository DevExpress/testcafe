// Request API
//----------------------------------------------------------------------------------------------------------------------

type IncomingMessage = import('http').IncomingMessage;

type Params = URLSearchParams | {[key: string]: string | number | boolean}

interface AuthOptions {
    username: string;
    password: string;
}

interface ProxyOptions {
    protocol?: string;
    host: string;
    port: number | string;
    auth?: AuthOptions;
}

type RequestUrlOpts = string | URL | RequestOptions;

type ResponseBody = IncomingMessage | Buffer | object | string;

interface RequestOptions {
    /**
     *  Request url.
     */
    url?: string | URL;
    /**
     * Request methods.
     */
    method?: string;
    /**
     * Request headers.
     */
    headers?: Record<string, string>;
    /**
     * Request params.
     */
    params?: Params;
    /**
     * Request body.
     */
    body?: any;
    /**
     * Request timeout.
     */
    timeout?: number;
    /**
     * Request credentials.
     */
    withCredentials?: boolean;
    /**
     * Request auth.
     */
    auth?: AuthOptions;
    /**
     * Request proxy.
     */
    proxy?: ProxyOptions;
    /**
     * Return raw response.
     */
    rawResponse?: boolean;
}

interface ResponseOptions {
    /**
     * Response status.
     */
    status: number;
    /**
     * Response status text.
     */
    statusText: string;
    /**
     * Response headers.
     */
    headers: object;
    /**
     * Response body.
     */
    body: ResponseBody;
}

interface ResponseAPI {
    /**
     * Promise that returns response status.
     */
    status: Promise<number>;
    /**
     * Promise that returns response status text.
     */
    statusText: Promise<string>;
    /**
     * Promise that returns response headers.
     */
    headers: Promise<object>;
    /**
     * Promise that returns response body.
     */
    body: Promise<ResponseBody>;
}


type RequestPromise = ResponseAPI | Promise<ResponseOptions>

interface Request {
    /**
     * Request
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    (urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
    /**
     * Execute a request with method GET.
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    get(urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
    /**
     * Execute a request with method DELETE.
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    delete(urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
    /**
     * Execute a request with method HEAD.
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    head(urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
    /**
     * Execute a request with method POST.
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    post(urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
    /**
     * Execute a request with method PUT.
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    put(urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
    /**
     * Execute a request with method PATCH.
     *
     * @param urlOpts - request url or options.
     * @param options - options.
     */
    patch(urlOpts: RequestUrlOpts, options?: RequestOptions): RequestPromise;
}
