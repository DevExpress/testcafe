import nanoid from 'nanoid';

export default class RequestHookProxy {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        this.id = nanoid();

        this.requestFilterRules              = requestFilterRules;
        this.responseEventConfigureOpts      = responseEventConfigureOpts;
    }

    async onRequest (/*RequestEvent event*/) {
        throw new Error('Not implemented');
    }

    _onConfigureResponse (event) {
        if (!this.responseEventConfigureOpts)
            return;

        event.opts.includeHeaders = this.responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody    = this.responseEventConfigureOpts.includeBody;
    }

    async onResponse (/*ResponseEvent event*/) {
        throw new Error('Not implemented');
    }
}
