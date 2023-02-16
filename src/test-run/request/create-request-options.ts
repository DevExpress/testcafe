import { OutgoingHttpHeaders } from 'http';
import {
    castArray,
    isArrayBuffer,
    isBuffer,
    isObject,
    isUndefined,
} from 'lodash';
import isStream from 'is-stream';
import {
    AuthOptions,
    Credentials,
    ExternalRequestOptions,
    Params,
} from './interfaces';
import {
    RequestOptions,
    parseProxyUrl,
    RequestOptionsParams,
    sameOriginCheck,
} from 'testcafe-hammerhead';
import TestRun from '../index';
import CONTENT_TYPES from '../../assets/content-types';
import HTTP_HEADERS from '../../utils/http-headers';
import { RUNTIME_ERRORS } from '../../errors/types';
import { APIError } from '../../errors/runtime';
import { GetProxyUrlCommand } from '../commands/actions';
import { CallsiteRecord } from 'callsite-record';

const DEFAULT_ACCEPT            = { [HTTP_HEADERS.accept]: `${CONTENT_TYPES.json}, ${CONTENT_TYPES.textPlain}, ${CONTENT_TYPES.all}` };
const METHODS_WITH_CONTENT_TYPE = ['post', 'put', 'patch'];
const DEFAULT_REQUEST_METHOD    = 'GET';
const DEFAULT_PROTOCOL          = 'http:';

function setContentTypeIfNotExists (headers: OutgoingHttpHeaders, value: string): void {
    if (!isUndefined(headers) && isUndefined(headers[HTTP_HEADERS.contentType]))
        headers[HTTP_HEADERS.contentType] = value;
}

function typeOf (value: unknown): string {
    if (value === null)
        return 'null';

    if (value && typeof value === 'object')
        return value.constructor.name.toLowerCase();

    return typeof value;
}

function transformBody (headers: OutgoingHttpHeaders, body?: any): Buffer {
    if (!body)
        return Buffer.from('');

    if (typeOf(body) === 'formdata' ||
        typeOf(body) === 'file' ||
        typeOf(body) === 'blob' ||
        isArrayBuffer(body) ||
        isBuffer(body) ||
        isStream(body)
    )
        return Buffer.from(body);
    else if (ArrayBuffer.isView(body))
        return Buffer.from(body.buffer);

    else if (body instanceof URLSearchParams) {
        setContentTypeIfNotExists(headers, `${CONTENT_TYPES.urlencoded};charset=utf-8`);

        return Buffer.from(body.toString());
    }
    else if (isObject(body) || headers && headers[HTTP_HEADERS.contentType] === CONTENT_TYPES.json) {
        setContentTypeIfNotExists(headers, CONTENT_TYPES.json);

        return Buffer.from(JSON.stringify(body));
    }
    else if (typeof body === 'string')
        setContentTypeIfNotExists(headers, CONTENT_TYPES.textPlain);

    return body;
}

function getAuthString (auth: AuthOptions): string {
    return 'Basic ' + Buffer.from(auth.username + ':' + auth.password, 'utf8').toString('base64');
}

function changeHeaderNamesToLowercase (headers: OutgoingHttpHeaders): OutgoingHttpHeaders {
    const lowerCaseHeaders: OutgoingHttpHeaders = {};

    Object.keys(headers).forEach(headerName => {
        lowerCaseHeaders[headerName.toLowerCase()] = headers[headerName];
    });

    return lowerCaseHeaders;
}

async function prepareHeaders (headers: OutgoingHttpHeaders, currentPageUrl: URL, url: URL, body: Buffer, testRun: TestRun, withCredentials: boolean, options: ExternalRequestOptions): Promise<OutgoingHttpHeaders> {
    const { host, origin } = url;

    const preparedHeaders: OutgoingHttpHeaders = Object.assign({}, DEFAULT_ACCEPT, changeHeaderNamesToLowercase(headers));

    preparedHeaders[HTTP_HEADERS.host]          = host;
    preparedHeaders[HTTP_HEADERS.origin]        = origin;
    preparedHeaders[HTTP_HEADERS.contentLength] = body.length;

    if (headers.method && METHODS_WITH_CONTENT_TYPE.includes(String(headers.method)))
        preparedHeaders[HTTP_HEADERS.contentType] = CONTENT_TYPES.urlencoded;

    if (options.auth && withCredentials)
        preparedHeaders[HTTP_HEADERS.authorization] = getAuthString(options.auth);

    if (options.proxy?.auth)
        preparedHeaders[HTTP_HEADERS.proxyAuthorization] = getAuthString(options.proxy.auth);

    if (withCredentials) {
        const currentPageCookies = await testRun.cookieProvider.getCookieHeader(currentPageUrl.href, currentPageUrl.hostname);

        if (currentPageCookies)
            preparedHeaders[HTTP_HEADERS.cookie] = currentPageCookies;
    }

    //NOTE: Additional header to recognize API requests in the hammerhead
    preparedHeaders[HTTP_HEADERS.isApiRequest] = 'true';

    return preparedHeaders;
}

async function prepareUrl (testRun: TestRun, currentPageUrl: URL, url: string | URL, callsite: CallsiteRecord | null): Promise<URL> {
    let preparedUrl: URL;

    try {
        preparedUrl = url instanceof URL
            ? url
            : new URL(url, currentPageUrl.hostname ? currentPageUrl.origin : void 0);
    }
    catch (e) {
        throw new APIError(callsite, RUNTIME_ERRORS.requestUrlInvalidValueError, url);
    }

    return preparedUrl;
}

function prepareSearchParams (url: string, params?: Params): string {
    if (!params)
        return url;

    let searchParams: URLSearchParams;

    if (params instanceof URLSearchParams)
        searchParams = params;
    else {
        searchParams = new URLSearchParams();

        for (const key in params) {
            if (!params[key])
                continue;

            castArray(params[key]).forEach(v => {
                searchParams.append(key, typeof v === 'object' ? JSON.stringify(v) : String(v));
            });
        }
    }

    return `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
}

function getProxyUrl (testRun: TestRun, url: string, withCredentials?: boolean): Promise<string> {
    return testRun.executeCommand(new GetProxyUrlCommand({
        url:     url,
        options: { credentials: withCredentials ? Credentials.include : Credentials.omit },
    }, testRun, true)) as Promise<string>;
}

async function resolvePoxylessUrlParts (url: URL): Promise<{ hostname: string; port: string; href: string; partAfterHost: string }> {
    const {
        href, hostname,
        port, pathname,
        search,
    } = url;

    const partAfterHost = [pathname, search].join('');

    return { partAfterHost, href, hostname, port };
}

async function resolvePoxyUrlParts (testRun: TestRun, url: URL, withCredentials: boolean): Promise<{ hostname: string; port: string; href: string; partAfterHost: string }> {
    const href               = await getProxyUrl(testRun, url.href, withCredentials);
    const urlObj             = await parseProxyUrl(href);
    const { partAfterHost }  = urlObj;
    const { hostname, port } = urlObj.proxy;

    return { partAfterHost, href, hostname, port };
}

function resolveUrlParts (testRun: TestRun, url: URL, withCredentials: boolean): Promise<{ hostname: string; port: string; href: string; partAfterHost: string }> {
    return testRun.isProxyless() ? resolvePoxylessUrlParts(url) : resolvePoxyUrlParts(testRun, url, withCredentials);
}

export async function createRequestOptions (currentPageUrl: URL, testRun: TestRun, options: ExternalRequestOptions, callsite: CallsiteRecord | null): Promise<RequestOptions> {
    options.headers = options.headers || {};

    const url             = await prepareUrl(testRun, currentPageUrl, options.url, callsite);
    const withCredentials = !currentPageUrl.host || sameOriginCheck(currentPageUrl.href, url.href) || options.withCredentials || false;
    const body            = transformBody(options.headers, options.body);
    const headers         = await prepareHeaders(options.headers, currentPageUrl, url, body, testRun, withCredentials, options);
    let auth              = options.auth;

    const {
        hostname,
        port,
        href,
        partAfterHost,
    } = await resolveUrlParts(testRun, url, withCredentials);

    if (!auth && url.username && url.password) {
        auth = {
            username: url.username,
            password: url.password,
        };
    }

    const requestParams: RequestOptionsParams = {
        method:         options.method || DEFAULT_REQUEST_METHOD,
        url:            href,
        protocol:       DEFAULT_PROTOCOL,
        hostname:       hostname,
        host:           hostname,
        port:           port,
        path:           prepareSearchParams(partAfterHost, options.params),
        auth:           auth && withCredentials ? `${auth.username}:${auth.password}` : void 0,
        headers:        headers,
        credentials:    withCredentials ? testRun.session.getAuthCredentials() : void 0,
        body:           body,
        disableHttp2:   testRun.session.isHttp2Disabled(),
        requestTimeout: {
            ajax: options.timeout,
            page: options.timeout,
        },
    };

    if (options.proxy) {
        requestParams.externalProxySettings = {
            host:      options.proxy.host,
            hostname:  options.proxy.host,
            port:      options.proxy.port.toString(),
            proxyAuth: options.proxy.auth ? `${options.proxy.auth.username}:${options.proxy.auth.password}` : void 0,
        };

        requestParams.protocol = url.protocol;
        requestParams.host     = url.host;
        requestParams.hostname = url.hostname;
        requestParams.port     = url.port;
        requestParams.path     = prepareSearchParams(url.pathname + url.search, options.params);
    }

    return new RequestOptions(requestParams);
}
