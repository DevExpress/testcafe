import {
    ConfigureResponseEvent,
    ConfigureResponseEventOptions,
    RequestEvent,
    ResponseEvent,
    RequestFilterRule,
    RequestFilterRuleInit,
    generateUniqueId
} from 'testcafe-hammerhead';

import { RequestHookNotImplementedMethodError } from '../../errors/test-run';
import WarningLog from '../../notifications/warning-log';


export default abstract class RequestHook {
    public _requestFilterRules: RequestFilterRule[];
    public readonly _responseEventConfigureOpts?: ConfigureResponseEventOptions;
    public _warningLog: WarningLog | null;
    public readonly id: string;
    public _className: string;

    protected constructor (ruleInit?: RequestFilterRuleInit | RequestFilterRuleInit[], responseEventConfigureOpts?: ConfigureResponseEventOptions) {
        this._requestFilterRules         = this._prepareRules(ruleInit);
        this._responseEventConfigureOpts = responseEventConfigureOpts;
        this._warningLog                 = null;
        this.id                          = generateUniqueId();
        this._className                  = this.constructor.name;
    }

    private _prepareRules (ruleInit?: RequestFilterRuleInit | RequestFilterRuleInit[]): RequestFilterRule[] {
        if (Array.isArray(ruleInit) && !ruleInit.length)
            return [];

        const rules = RequestFilterRule.fromArray(ruleInit);

        return !rules.length ? [RequestFilterRule.ANY] : rules;
    }

    public async onRequest (event: RequestEvent): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
        throw new RequestHookNotImplementedMethodError('onRequest', this.constructor.name);
    }

    public async _onConfigureResponse (event: ConfigureResponseEvent): Promise<void> {
        if (!this._responseEventConfigureOpts)
            return;

        event.opts.includeHeaders = this._responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody    = this._responseEventConfigureOpts.includeBody;
    }

    public async onResponse (event: ResponseEvent): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
        throw new RequestHookNotImplementedMethodError('onResponse', this.constructor.name);
    }
}
