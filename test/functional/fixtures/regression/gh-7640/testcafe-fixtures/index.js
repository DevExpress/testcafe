import { RequestHook, Selector } from 'testcafe';

class MyRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        super(requestFilterRules, responseEventConfigureOpts);
    }

    async onRequest (e) {
        e.requestOptions.hostname = 'localhost';
        e.requestOptions.port = 3001;
    }

    async onResponse () {
    }
}

const customHook = new MyRequestHook(/api/);
const logger     = Selector('div');

fixture `Redirect on the Request Hook`
    .page `http://localhost:3000/fixtures/regression/gh-7640/pages/index.html`;

test('No redirect', async t => {
    await t.click('button');

    await t.expect(logger.innerText).eql('{"name":"John Hearts","position":"CTO"}');
});

test.requestHooks(customHook)(`Redirect on the Request Hook`, async t => {
    await t.click('button');

    await t.expect(logger.innerText).eql('{"name":"James Livers","position":"CEO"}');
});
