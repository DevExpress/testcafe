import { RequestFilterRule } from 'testcafe-hammerhead';
import { castArray } from 'lodash';
import { RequestHookNotImplementedMethodError } from '../../errors/test-run';

export default class RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        this.requestFilterRules              = this._prepareRequestFilterRules(requestFilterRules);
        this._instantiatedRequestFilterRules = [];
        this.responseEventConfigureOpts      = responseEventConfigureOpts;

        this.warningLog = null;
    }

    _prepareRequestFilterRules (rules) {
        if (rules)
            return castArray(rules);

        return [RequestFilterRule.ANY];
    }

    _instantiateRequestFilterRules () {
        this._instantiatedRequestFilterRules = [];

        this.requestFilterRules.forEach(rule => {
            const instantiatedRule = rule instanceof RequestFilterRule ? rule : new RequestFilterRule(rule);

            this._instantiatedRequestFilterRules.push(instantiatedRule);
        });
    }

    async onRequest (/*RequestEvent event*/) {
        throw new RequestHookNotImplementedMethodError('onRequest', this.constructor.name);
    }

    _onConfigureResponse (event) {
        if (!this.responseEventConfigureOpts)
            return;

        event.opts.includeHeaders = this.responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody    = this.responseEventConfigureOpts.includeBody;
    }

    async onResponse (/*ResponseEvent event*/) {
        throw new RequestHookNotImplementedMethodError('onResponse', this.constructor.name);
    }
}
