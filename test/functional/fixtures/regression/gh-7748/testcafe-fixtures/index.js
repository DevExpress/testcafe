import { RequestHook, Selector } from 'testcafe';

export default class CustomRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        super(requestFilterRules, responseEventConfigureOpts);
    }

    async onRequest (requestEvent) {
        requestEvent.requestOptions.headers['user-agent'] = 'test';
    }

    async onResponse () {
    }
}

fixture `Should modify header on RequestHook`
    .page('http://localhost:3000/fixtures/regression/gh-7748/pages/index.html')
    .requestHooks(new CustomRequestHook());

test('Set / override request headers', async t => {
    await t.expect(Selector('#target').innerText).eql('Other');
});
