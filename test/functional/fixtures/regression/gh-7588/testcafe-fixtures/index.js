import { RequestLogger } from 'testcafe';

const logger = RequestLogger(
    { url: /xhr/, method: 'POST' },
    {
        logRequestBody:       true,
        stringifyRequestBody: true,
    }
);

fixture('Request body encoding in Native Automation in RequestLogger')
    .page('http://localhost:3000/fixtures/regression/gh-7588/pages/index.html');

test('Request body encoding in Native Automation in RequestLogger', async t => {
    await t.addRequestHooks(logger);
    await t.click('button');

    await t.expect(logger.requests[0].request.body).eql('{"key":"value"}');

});
