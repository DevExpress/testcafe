import RequestHook from '../../api/request-hooks/hook';

export default class RequestHookProxy extends RequestHook {
    constructor ({ id, requestFilterRules, responseEventConfigureOpts }) {
        super(RequestHookProxy._proxyFilterRules(requestFilterRules), responseEventConfigureOpts);

        this.id = id;
    }

    static _proxyFilterRules (rules) {
        return rules.map(rule => {
            if (rule.type === 'function')
                return request => compiler._sendMessage({ name: 'filter-rule', hookId: this.id, ruleId: rule.id, request });

            if (rule.type === 'regexp' || rule.type === 'string')
                rule = { url: { rule } };

            if (rule.url.type === 'regexp')
                rule.url = new RegExp(rule.url.source, rule.url.flags);
            else
                rule.url = rule.value;

            return rule;
        });
    }

    async onRequest(event) {
        await compiler._sendMessage({ name: 'on-request', id: this.id, event });
    }

    async onResponse (event) {
        await compiler._sendMessage({ name: 'on-response', id: this.id, event })
    }

    async _onConfigureResponse (event) {
        await compiler._sendMessage({ name: 'on-configure-response', id: this.id, event });
    }
}
