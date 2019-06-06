import RequestHook from '../../api/request-hooks/hook';

export default class RequestHookProxy extends RequestHook {
    constructor (transmitter, { id, requestFilterRules, responseEventConfigureOpts }) {
        super(RequestHookProxy._proxyFilterRules(requestFilterRules), responseEventConfigureOpts);

        this.id = id;
        this.transmitter = transmitter;
    }

    static _proxyFilterRules (rules) {
        return rules.map(rule => {
            if (rule.type === 'function')
                return request => this.transmitter.send('filter-rule', { id: rule.id, request });

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
        await this.transmitter.send('on-request', { id: this.id, event });
    }

    async onResponse (event) {
        await this.transmitter.send('on-response', { id: this.id, event })
    }

    async _onConfigureResponse (event) {
        await this.transmitter.send('on-configure-response', { id: this.id, event });
    }
}
