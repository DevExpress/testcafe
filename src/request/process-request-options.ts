import { OutgoingHttpHeaders } from 'http';
import {
    isArrayBuffer, isBuffer, isObject, isUndefined,
} from 'lodash';
import isStream from 'is-stream';
import { ExternalRequestOptions } from './interfaces';
import { RequestOptions, generateUniqueId } from 'testcafe-hammerhead';
import TestRun from '../test-run';
import CONTENT_TYPES from '../assets/content-types';
import HTTP_HEADERS from '../utils/http-headers'

const DEFAULT_ACCEPT            = { [HTTP_HEADERS.accept]: `${CONTENT_TYPES.json}, ${CONTENT_TYPES.textPlain}, ${CONTENT_TYPES.all}` };
const DEFAULT_CONTENT_TYPE      = { [HTTP_HEADERS.contentType]: CONTENT_TYPES.urlencoded };
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

function transformBody (body: any, headers: OutgoingHttpHeaders): any {
    if (typeOf(body) === 'formdata' ||
        typeOf(body) === 'file' ||
        typeOf(body) === 'blob' ||
        isArrayBuffer(body) ||
        isBuffer(body) ||
        isStream(body)
    )
        return body;
    else if (ArrayBuffer.isView(body))
        return body.buffer;

    else if (body instanceof URLSearchParams) {
        setContentTypeIfUnset(headers, `${CONTENT_TYPES.urlencoded};charset=utf-8`);
        return body.toString();
    }
    else if (isObject(body) || headers && headers[HTTP_HEADERS.contentType] === CONTENT_TYPES.json) {
        setContentTypeIfUnset(headers, CONTENT_TYPES.json);
        return JSON.stringify(body);
    }

    return body || '';
}

function prepareHeaders (headers: OutgoingHttpHeaders = {}): OutgoingHttpHeaders {
    const contentType = headers.method && METHODS_WITH_CONTENT_TYPE.includes(String(headers.method))
        ? DEFAULT_CONTENT_TYPE : {};

    return Object.assign(DEFAULT_ACCEPT, DEFAULT_IS_REQUEST, contentType, headers);
}

export function processRequestOptions (testRun: TestRun, options: ExternalRequestOptions = {}): RequestOptions {
    const url = new URL(options.url || '');

    options.headers = options.headers || {};

    const body    = transformBody(options.body, options.headers);
    const headers = prepareHeaders(options.headers) || {};

    return new RequestOptions(Object.assign(DEFAULT_OPTIONS, options, {
        url:      testRun.session.getProxyUrl(url.href),
        protocol: url.protocol,
        hostname: url.hostname,
        host:     url.host,
        port:     url.port,
        path:     url.pathname,
        //TODO: to research why there is string in th HH
        auth:     '',
        headers,
        body,
    }));
}
