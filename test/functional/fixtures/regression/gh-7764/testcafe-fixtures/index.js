import { RequestLogger, RequestHook } from 'testcafe';

fixture`Set a Custom Referer`
    .page`http://localhost:3000/fixtures/regression/gh-7764/pages/index.html`;

export class MyRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        super(requestFilterRules, responseEventConfigureOpts);
    }

    async onRequest (event) {
        event.requestOptions.headers['referer'] = 'http://my-modified-referer.com';
    }

    async onResponse () {
    }
}

const hook = new MyRequestHook();

const logger = RequestLogger('http://localhost:3000/fixtures/regression/gh-7764/pages/index.html', {
    logRequestHeaders: true,
});

test
    .requestHooks([hook, logger])
    ('Request logger should contain actual headers if RequestHook modified themd', async t => {
        await t.expect(logger.requests[0].request.headers['referer']).eql('http://my-modified-referer.com');
    });
