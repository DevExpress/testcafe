import { OutgoingHttpHeaders } from 'http';
import {
    isArrayBuffer, isBuffer, isObject, isUndefined,
} from 'lodash';
import isStream from 'is-stream';
import { AuthOptions, ExternalRequestOptions } from './interfaces';
import { RequestOptions, generateUniqueId } from 'testcafe-hammerhead';
import TestRun from '../test-run';
import CONTENT_TYPES from '../assets/content-types';
import HTTP_HEADERS from '../utils/http-headers';

const DEFAULT_ACCEPT            = { [HTTP_HEADERS.accept]: `${CONTENT_TYPES.json}, ${CONTENT_TYPES.textPlain}, ${CONTENT_TYPES.all}` };
const DEFAULT_IS_REQUEST        = { [HTTP_HEADERS.isRequest]: true };
const METHODS_WITH_CONTENT_TYPE = ['post', 'put', 'patch'];
const DEFAULT_REQUEST_TIMEOUT   = 2 * 60 * 1000;
const DEFAULT_REQUEST_METHOD    = 'GET';
const DEFAULT_OPTIONS           = {
    method:         DEFAULT_REQUEST_METHOD,
    isAjax:         true,
    requestId:      generateUniqueId(),
    isWebSocket:    false,
    requestTimeout: {
        ajax: DEFAULT_REQUEST_TIMEOUT,
        page: 0,
    },
};

function setContentTypeIfUnset (headers: OutgoingHttpHeaders, value: string): void {
    if (!isUndefined(headers) && isUndefined(headers[HTTP_HEADERS.contentType]))
        headers[HTTP_HEADERS.contentType] = value;
}

function typeOf (value: unknown): string {
    if (value === null)
        return 'null';

    if (value && typeof value === 'object')
        return value.toString().slice(8, -1).toLowerCase();

    return typeof value;
}

function transformBody (headers: OutgoingHttpHeaders, body?: object): Buffer {
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
        setContentTypeIfUnset(headers, `${CONTENT_TYPES.urlencoded};charset=utf-8`);
        return Buffer.from(body.toString());
    }
    else if (isObject(body) || headers && headers[HTTP_HEADERS.contentType] === CONTENT_TYPES.json) {
        setContentTypeIfUnset(headers, CONTENT_TYPES.json);
        return Buffer.from(JSON.stringify(body));
    }

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

function prepareHeaders (headers: OutgoingHttpHeaders = {}, options: ExternalRequestOptions): OutgoingHttpHeaders {
    const preparedHeaders: OutgoingHttpHeaders = Object.assign(DEFAULT_ACCEPT, DEFAULT_IS_REQUEST, changeHeaderNamesToLowercase(headers));

    if (headers.method && METHODS_WITH_CONTENT_TYPE.includes(String(headers.method)))
        preparedHeaders[HTTP_HEADERS.contentType] = CONTENT_TYPES.urlencoded;

    if (options.auth)
        preparedHeaders[HTTP_HEADERS.authorization] = getAuthString(options.auth);

    if (options.proxy?.auth)
        preparedHeaders[HTTP_HEADERS.proxyAuthorization] = getAuthString(options.proxy.auth);

    return preparedHeaders;
}

export function processRequestOptions (testRun: TestRun, options: ExternalRequestOptions): RequestOptions {
    const url = new URL(options.url || '');

    options.headers = options.headers || {};

    const body    = transformBody(options.headers, options.body);
    const headers = prepareHeaders(options.headers, options) || {};

    const externalProxySettings = options.proxy ? {
        host:      options.proxy.host || '',
        hostname:  options.proxy.host || '',
        port:      options.proxy.port.toString(),
        proxyAuth: options.proxy.auth ? options.proxy.auth.username + ':' + options.proxy.auth.password : '',
    } : void 0;

    return new RequestOptions(Object.assign(DEFAULT_OPTIONS, options, {
        url:      testRun.session.getProxyUrl(url.href),
        protocol: url.protocol,
        hostname: url.hostname,
        host:     url.host,
        port:     url.port,
        path:     url.pathname,
        auth:     options.auth ? `${options.auth.username}:${options.auth.password}` : '',
        headers,
        body,
        externalProxySettings,
    }));
}
