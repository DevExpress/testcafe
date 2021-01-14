import RequestHook from './hook';

import {
    ResponseMock,
    RequestEvent,
    ResponseEvent,
    RequestFilterRule
} from 'testcafe-hammerhead';

import { APIError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import WARNING_MESSAGE from '../../notifications/warning-message';
import { RequestFilterRuleInit } from './interfaces';


class RequestMock extends RequestHook {
    private _pendingRequestFilterRuleInit: null | RequestFilterRuleInit;
    private _mocks: Map<RequestFilterRule, ResponseMock>;

    public constructor () {
        super([]);

        this._pendingRequestFilterRuleInit = null;
        this._mocks                        = new Map();
    }

    public async onRequest (event: RequestEvent): Promise<void> {
        const mock = this._mocks.get(event._requestFilterRule) as ResponseMock;

        event.setMock(mock);
    }

    public async onResponse (event: ResponseEvent): Promise<void> {
        if (event.isSameOriginPolicyFailed)
            this.warningLog?.addWarning(WARNING_MESSAGE.requestMockCORSValidationFailed, RequestMock.name, event._requestFilterRule);
    }

    // API
    public onRequestTo (requestFilterRuleInit: RequestFilterRuleInit): RequestMock {
        if (this._pendingRequestFilterRuleInit)
            throw new APIError('onRequestTo', RUNTIME_ERRORS.requestHookConfigureAPIError, RequestMock.name, "The 'respond' method was not called after 'onRequestTo'. You must call the 'respond' method to provide the mocked response.");

        this._pendingRequestFilterRuleInit = requestFilterRuleInit;

        return this;
    }

    public respond (body: string | Function, statusCode?: number, headers?: object): RequestMock {
        if (!this._pendingRequestFilterRuleInit)
            throw new APIError('respond', RUNTIME_ERRORS.requestHookConfigureAPIError, RequestMock.name, "The 'onRequestTo' method was not called before 'respond'. You must call the 'onRequestTo' method to provide the URL requests to which are mocked.");

        const mock = new ResponseMock(body, statusCode, headers);
        const rule = new RequestFilterRule(this._pendingRequestFilterRuleInit);

        this.requestFilterRules.push(rule);
        this._mocks.set(rule, mock);
        this._pendingRequestFilterRuleInit = null;

        return this;
    }
}

export default function createRequestMock (): RequestMock {
    return new RequestMock();
}
