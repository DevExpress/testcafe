import { merge } from 'lodash';
import RequestHook from '../../api/request-hooks/hook';

export default class RequestHookProxy extends RequestHook {
    constructor (transmitter, { id, requestFilterRules, responseEventConfigureOpts }) {
        super(RequestHookProxy._proxyFilterRules(requestFilterRules), responseEventConfigureOpts);

        this.id = id;
        this.transmitter = transmitter;
    }

    static _proxyFilterRules (rules) {
        if (!rules)
            return;

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
        const safeEvent = { requestOptions: event.requestOptions };

        await this.transmitter.send('on-request', { id: this.id, safeEvent });
    }

    async onResponse (event) {
        console.log(event);
        await this.transmitter.send('on-response', { id: this.id, event })
    }

    async _onConfigureResponse (event) {
        const safeEvent     = { opts: event.opts };
        const modifiedEvent = await this.transmitter.send('on-configure-response', { id: this.id, event: safeEvent });

        merge(event, modifiedEvent);
    }
}
