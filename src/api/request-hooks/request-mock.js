import RequestHook from './hook';
import { ResponseMock, RequestFilterRule } from 'testcafe-hammerhead';
import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';

class RequestMock extends RequestHook {
    constructor () {
        super([]);

        this.pendingRequestFilterRuleInit = null;
        this.mocks                        = new Map();
    }

    onRequest (event) {
        const mock = this.mocks.get(event._requestFilterRule);

        event.setMock(mock);
    }

    onResponse () {}

    // API
    onRequestTo (requestFilterRuleInit) {
        if (this.pendingRequestFilterRuleInit)
            throw new APIError('onRequestTo', MESSAGE.requestHookConfigureAPIError, RequestMock.name, "The 'respond' method was not called after 'onRequestTo'. You must call the 'respond' method to provide the mocked response.");

        this.pendingRequestFilterRuleInit = requestFilterRuleInit;

        return this;
    }

    respond (body, statusCode, headers) {
        if (!this.pendingRequestFilterRuleInit)
            throw new APIError('respond', MESSAGE.requestHookConfigureAPIError, RequestMock.name, "The 'onRequestTo' method was not called before 'respond'. You must call the 'onRequestTo' method to provide the URL requests to which are mocked.");

        const mock = new ResponseMock(body, statusCode, headers);
        const rule = new RequestFilterRule(this.pendingRequestFilterRuleInit);

        this.requestFilterRules.push(rule);
        this.mocks.set(rule, mock);
        this.pendingRequestFilterRuleInit = null;

        return this;
    }
}

export default function createRequestMock () {
    return new RequestMock();
}
