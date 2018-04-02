import { RequestFilterRule } from 'testcafe-hammerhead';
import { castArray } from 'lodash';

export default class RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        this.requestFilterRules              = this._prepareRequestFilterRules(requestFilterRules);
        this._instantiatedRequestFilterRules = [];
        this.responseEventConfigureOpts      = responseEventConfigureOpts;
    }

    _prepareRequestFilterRules (rules) {
        if (rules)
            return castArray(rules);

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
        throw new Error('Not implemented');
    }

    _onConfigureResponse (event) {
        if (!this.responseEventConfigureOpts)
            return;

        event.opts.includeHeaders = this.responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody    = this.responseEventConfigureOpts.includeBody;
    }

    onResponse (/*ResponseEvent event*/) {
        throw new Error('Not implemented');
    }
}
