import {
    BaseRequestHookEventFactory,
    ConfigureResponseEvent,
    RequestFilterRule,
    RequestInfo,
    RequestOptions,
    RequestOptionsParams,
    ResponseInfo,
} from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import Request = Protocol.Network.Request;
import { fromBase64String } from '../utils/string';
import { StatusCodes } from 'http-status-codes';
import { convertToOutgoingHttpHeaders } from '../utils/cdp';


export default class ProxylessEventFactory extends BaseRequestHookEventFactory {
    private _event: RequestPausedEvent;
    private _responseBody: Buffer;
    private readonly _sessionId: string;

    public constructor (event: RequestPausedEvent, sessionId: string) {
        super();

        this._event        = event;
        this._responseBody = Buffer.alloc(0);
        this._sessionId    = sessionId;
    }

    private static _getRequestData (request: Request): Buffer {
        if (request.postData)
            return fromBase64String(request.postData);

        return Buffer.alloc(0);
    }

    private static _getIsAjaxRequest (event: RequestPausedEvent): boolean {
        return event.resourceType === 'XHR'
            || event.resourceType === 'Fetch';
    }

    public update (event: RequestPausedEvent): void {
        this._event = event;
    }

    public setResponseBody (body: Buffer): void {
        this._responseBody = body;
    }

    public createRequestInfo (): RequestInfo {
        const { requestId, request } = this._event;

        return new RequestInfo({
            requestId,
            sessionId: this._sessionId,
            userAgent: RequestInfo.getUserAgent(request.headers),
            url:       request.url,
            method:    request.method,
            headers:   request.headers,
            body:      ProxylessEventFactory._getRequestData(request),
        });
    }

    public createRequestOptions (): RequestOptions {
        const parsedUrl = new URL(this._event.request.url);

        const requestParams: RequestOptionsParams = {
            method:   this._event.request.method,
            url:      this._event.request.url,
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            host:     parsedUrl.host,
            port:     parsedUrl.port,
            path:     parsedUrl.pathname,
            headers:  this._event.request.headers,
            body:     ProxylessEventFactory._getRequestData(this._event.request),
            isAjax:   ProxylessEventFactory._getIsAjaxRequest(this._event),
        };

        if (parsedUrl.username)
            requestParams.auth = parsedUrl.username + ':' + parsedUrl.password;

        return new RequestOptions(requestParams);
    }

    public createConfigureResponseEvent (rule: RequestFilterRule): ConfigureResponseEvent {
        return new ConfigureResponseEvent(rule, null);
    }

    public createResponseInfo (): ResponseInfo {
        return new ResponseInfo({
            statusCode:               this._event.responseStatusCode || StatusCodes.OK,
            headers:                  convertToOutgoingHttpHeaders(this._event.responseHeaders),
            body:                     this._responseBody,
            sessionId:                '',
            requestId:                this._event.requestId,
            isSameOriginPolicyFailed: false,
        });
    }
}
