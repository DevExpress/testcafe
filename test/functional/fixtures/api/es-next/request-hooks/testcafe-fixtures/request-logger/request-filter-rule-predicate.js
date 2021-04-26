import { RequestLogger } from 'testcafe';

const targetPageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';
const page2Url      = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/page2.html';

const logger = new RequestLogger(req => {
    return req.url === targetPageUrl;
});

fixture `Fixture`
    .page(page2Url)
    .requestHooks(logger);

test('test', async t => {
    await t
        .navigateTo(targetPageUrl)
        .expect(logger.contains(r => r.response.statusCode === 200)).ok()
        .expect(logger.count(r => r.request.url === targetPageUrl)).eql(1);

    await t.expect(logger.requests.length).eql(1);
});
