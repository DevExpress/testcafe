import {
    BaseRequestHookEventFactory,
    RequestInfo,
    RequestOptions,
    RequestOptionsParams,
} from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import Request = Protocol.Network.Request;
import { fromBase64String } from '../utils/string';


export default class ProxylessEventFactory extends BaseRequestHookEventFactory {
    private readonly _event: RequestPausedEvent;

    public constructor (event: RequestPausedEvent) {
        super();

        this._event = event;
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

    public createRequestInfo (): RequestInfo {
        const { requestId, request } = this._event;

        return new RequestInfo({
            requestId,
            sessionId: '',
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
}
