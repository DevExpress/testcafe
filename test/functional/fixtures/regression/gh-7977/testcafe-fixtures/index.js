import { RequestLogger } from 'testcafe';

const logger = new RequestLogger(/api\/data/, {
    logResponseBody:       true,
    logRequestHeaders:     true,
    stringifyResponseBody: true,
});

fixture `Concurrent request loggers`
    .page `http://localhost:3000/fixtures/regression/gh-7977/pages/index.html`
    .requestHooks(logger);

for (let i = 0; i < 3; i++) {
    test(`send multiple requests - ${i}`, async t => {
        await t.click('button');

        require('./requestCounter').add(logger.requests.filter(r => !!r.response.body).length);
    });
}


