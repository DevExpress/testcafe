import { RequestLogger } from 'testcafe';

const logger = RequestLogger(void 0, {
    logRequestHeaders: true,
});

fixture `GH-7575 - Authorization header should not be modified in the native automation mode`
    .page `http://localhost:3000/fixtures/regression/gh-7575/pages/index.html`;

test(`Send XHR`, async t => {
    await t.addRequestHooks(logger);
    await t.click('button');

    const header = logger.requests[0].request.headers['authorization'];

    await t.expect(header).eql('test');
});

