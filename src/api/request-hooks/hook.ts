import {
    RequestFilterRule,
    ConfigureResponseEvent,
    ConfigureResponseEventOptions,
    RequestEvent,
    ResponseEvent
} from 'testcafe-hammerhead';

import { castArray } from 'lodash';
import { RequestHookNotImplementedMethodError } from '../../errors/test-run';
import { RequestFilterRuleInit } from './interfaces';
import WarningLog from '../../notifications/warning-log';


export default abstract class RequestHook {
    protected requestFilterRules: RequestFilterRuleInit[];
    private _instantiatedRequestFilterRules: RequestFilterRule[];
    private readonly _responseEventConfigureOpts?: ConfigureResponseEventOptions;
    protected warningLog: WarningLog | null;

    protected constructor (requestFilterRules: RequestFilterRuleInit | RequestFilterRuleInit[] | undefined, responseEventConfigureOpts?: ConfigureResponseEventOptions) {
        this.requestFilterRules              = this._prepareRequestFilterRules(requestFilterRules);
        this._instantiatedRequestFilterRules = [];
        this._responseEventConfigureOpts     = responseEventConfigureOpts;

        this.warningLog = null;
    }

    private _prepareRequestFilterRules (rules: RequestFilterRuleInit | RequestFilterRuleInit[] | undefined): RequestFilterRuleInit[] {
        if (rules)
            return castArray(rules);

        return [RequestFilterRule.ANY];
    }

    private _instantiateRequestFilterRules (): void {
        this._instantiatedRequestFilterRules = [];

        this.requestFilterRules.forEach(rule => {
            const instantiatedRule = rule instanceof RequestFilterRule ? rule : new RequestFilterRule(rule);

            this._instantiatedRequestFilterRules.push(instantiatedRule);
        });
    }

    protected async onRequest (event: RequestEvent): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
        throw new RequestHookNotImplementedMethodError('onRequest', this.constructor.name);
    }

    private _onConfigureResponse (event: ConfigureResponseEvent): void {
        if (!this._responseEventConfigureOpts)
            return;

        event.opts.includeHeaders = this._responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody    = this._responseEventConfigureOpts.includeBody;
    }

    protected async onResponse (event: ResponseEvent): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
        throw new RequestHookNotImplementedMethodError('onResponse', this.constructor.name);
    }
}
