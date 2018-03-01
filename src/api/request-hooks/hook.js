import { RequestFilterRule } from 'testcafe-hammerhead';

export default class RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        this.requestFilterRules              = this._prepareRequestFilterRules(requestFilterRules);
        this._instantiatedRequestFilterRules = [];
        this.responseEventConfigureOpts      = responseEventConfigureOpts;
    }

    _prepareRequestFilterRules (rules) {
        if (rules)
            return Array.isArray(rules) ? rules : [rules];

        return [RequestFilterRule.ANY];
    }

    _instantiateRequestFilterRules () {
        this.requestFilterRules.forEach(rule => {
            if (rule instanceof RequestFilterRule)
                this._instantiatedRequestFilterRules.push(rule);
            else
                this._instantiatedRequestFilterRules.push(new RequestFilterRule(rule));
        });
    }

    onRequest (/*RequestEvent event*/) {
    }

    _onConfigureResponse (event) {
        if (!this.responseEventConfigureOpts)
            return;

        event.opts.includeHeaders = this.responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody    = this.responseEventConfigureOpts.includeBody;
    }

    onResponse (/*ResponseEvent event*/) {
    }
}
