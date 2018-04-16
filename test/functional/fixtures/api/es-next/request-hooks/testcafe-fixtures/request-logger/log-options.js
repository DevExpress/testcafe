import { RequestLogger } from 'testcafe';
import { readFileSync } from 'fs';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';
const logger  = new RequestLogger(pageUrl, {
    logResponseBody:       true,
    stringifyResponseBody: true
});

fixture `RequestLogger`
    .page(pageUrl)
    .requestHooks(logger);

test('Log options', async t => {
    await t.expect(logger.contains(r => r.response.statusCode === 200)).ok();

    const fileContent = readFileSync('./test/functional/fixtures/api/es-next/request-hooks/pages/index.html').toString();

    await t.expect(logger.requests[0].response.body).eql(fileContent);
});
