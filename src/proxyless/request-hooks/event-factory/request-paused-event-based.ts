import {
    BaseRequestHookEventFactory,
    ConfigureResponseEvent,
    ModifyResponseFunctions,
    RequestFilterRule,
    RequestInfo,
    RequestOptions,
    RequestOptionsParams,
    ResponseInfo,
} from 'testcafe-hammerhead';
import { remove } from 'lodash';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import Request = Protocol.Network.Request;
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import { fromBase64String } from '../../utils/string';
import { StatusCodes } from 'http-status-codes';
import { convertToOutgoingHttpHeaders, lowerCaseHeaderNames } from '../../utils/headers';


export default class RequestPausedEventBasedEventFactory extends BaseRequestHookEventFactory {
    private _event: RequestPausedEvent;
    private _responseBody: Buffer;
    private readonly _sessionId: string;
    private readonly _modifyResponseFunction: ModifyResponseFunctions;
    public headersModified: boolean;

    public constructor (event: RequestPausedEvent, sessionId: string) {
        super();

        this._event                  = event;
        this._responseBody           = Buffer.alloc(0);
        this._sessionId              = sessionId;
        this._modifyResponseFunction = this._createModifyResponseFunctions();
        this.headersModified         = false;
    }

    private _createModifyResponseFunctions (): ModifyResponseFunctions {
        return {
            setHeader: (name: string, value: string) => {
                const header = (this._event.responseHeaders as HeaderEntry[]).find(h => h.name.toLowerCase() === name.toLowerCase());

                if (!header)
                    (this._event.responseHeaders as HeaderEntry[]).push({ name, value });
                else
                    header.value = value;

                this.headersModified = true;
            },
            removeHeader: (name: string) => {
                remove(this._event.responseHeaders as HeaderEntry[], header => header.name.toLowerCase() === name.toLowerCase());

                this.headersModified = true;
            },
        };
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
            method:    request.method.toLowerCase(),
            headers:   lowerCaseHeaderNames(request.headers),
            body:      RequestPausedEventBasedEventFactory._getRequestData(request),
            isAjax:    RequestPausedEventBasedEventFactory._getIsAjaxRequest(this._event),
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
            body:     RequestPausedEventBasedEventFactory._getRequestData(this._event.request),
            isAjax:   RequestPausedEventBasedEventFactory._getIsAjaxRequest(this._event),
        };

        if (parsedUrl.username)
            requestParams.auth = parsedUrl.username + ':' + parsedUrl.password;

        return new RequestOptions(requestParams);
    }

    public createConfigureResponseEvent (rule: RequestFilterRule): ConfigureResponseEvent {
        return new ConfigureResponseEvent(rule, this._modifyResponseFunction);
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
