import RequestHook from './hook';
import { ResponseMock, RequestFilterRule, SAME_ORIGIN_CHECK_FAILED_STATUS_CODE } from 'testcafe-hammerhead';
import { APIError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import WARNING_MESSAGE from '../../notifications/warning-message';

class RequestMock extends RequestHook {
    constructor () {
        super([]);

        this.pendingRequestFilterRuleInit = null;
        this.mocks                        = new Map();
    }

    async onRequest (event) {
        const mock = this.mocks.get(event._requestFilterRule);

        event.setMock(mock);
    }

    async onResponse (event) {
        if (event.statusCode === SAME_ORIGIN_CHECK_FAILED_STATUS_CODE)
            this.warningLog.addWarning(WARNING_MESSAGE.requestMockCORSValidationFailed, RequestMock.name, event._requestFilterRule);
    }

    // API
    onRequestTo (requestFilterRuleInit) {
        if (this.pendingRequestFilterRuleInit)
            throw new APIError('onRequestTo', RUNTIME_ERRORS.requestHookConfigureAPIError, RequestMock.name, "The 'respond' method was not called after 'onRequestTo'. You must call the 'respond' method to provide the mocked response.");

        this.pendingRequestFilterRuleInit = requestFilterRuleInit;

        return this;
    }

    respond (body, statusCode, headers) {
        if (!this.pendingRequestFilterRuleInit)
            throw new APIError('respond', RUNTIME_ERRORS.requestHookConfigureAPIError, RequestMock.name, "The 'onRequestTo' method was not called before 'respond'. You must call the 'onRequestTo' method to provide the URL requests to which are mocked.");

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
