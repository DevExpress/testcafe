import {
    BaseRequestHookEventFactory,
    ConfigureResponseEvent,
    ModifyResponseFunctions,
    RequestFilterRule,
    RequestInfo,
    RequestOptions,
    ResponseInfo,
} from 'testcafe-hammerhead';
import Protocol from 'devtools-protocol';
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import { getRequestId } from '../../utils/cdp';

export default class FrameNavigatedEventBasedEventFactory extends BaseRequestHookEventFactory {
    private readonly _event: FrameNavigatedEvent;
    private readonly _sessionId: string;
    public constructor (event: FrameNavigatedEvent, sessionId: string) {
        super();

        this._event     = event;
        this._sessionId = sessionId;
    }

    public createRequestInfo (): RequestInfo {
        // NOTE: We can't get some request information from the FrameNavigated event.
        // So, we initialize the RequestInfo object with empty or default values.
        return new RequestInfo({
            requestId: getRequestId(this._event),
            sessionId: this._sessionId,
            userAgent: '',
            url:       this._event.frame.url,
            method:    '',
            headers:   {},
            body:      Buffer.alloc(0),
            isAjax:    false,
        });
    }

    public createConfigureResponseEvent (rule: RequestFilterRule): ConfigureResponseEvent {
        // NOTE: Used as a stub
        return new ConfigureResponseEvent(rule, {} as ModifyResponseFunctions);
    }

    public createRequestOptions (): RequestOptions {
        // NOTE: Used as a stub
        return {} as RequestOptions;
    }

    public createResponseInfo (): ResponseInfo {
        // NOTE: Used as a stub
        return {} as ResponseInfo;
    }
}
