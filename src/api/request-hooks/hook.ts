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
    public _requestFilterRules: RequestFilterRuleInit[];
    private readonly _responseEventConfigureOpts?: ConfigureResponseEventOptions;
    public _warningLog: WarningLog | null;
    public id: string;

    protected constructor (ruleInit?: RequestFilterRuleInit | RequestFilterRuleInit[], responseEventConfigureOpts?: ConfigureResponseEventOptions) {
        this._requestFilterRules         = this._prepareRules(ruleInit);
        this._responseEventConfigureOpts = responseEventConfigureOpts;
        this._warningLog                 = null;
        this.id                          = generateUniqueId();
    }

    private _prepareRules (ruleInit?: RequestFilterRuleInit | RequestFilterRuleInit[]): RequestFilterRule[] {
        if (Array.isArray(ruleInit) && !ruleInit.length)
            return [];

        const rules = RequestFilterRule.from(ruleInit);

        return !rules.length ? [RequestFilterRule.ANY] : rules;
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
