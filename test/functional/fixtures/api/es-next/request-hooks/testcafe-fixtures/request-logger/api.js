import { RequestLogger } from 'testcafe';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';
const logger  = new RequestLogger(pageUrl);

fixture `RequestLogger`
    .page(pageUrl);

test
    .requestHooks(logger)
    ('API', async t => {
        await t
            .expect(logger.contains(r => r.response.statusCode === 200)).ok()
            .expect(logger.count(r => r.request.url === pageUrl)).eql(1);

        logger.clear();

        await t
            .expect(logger.contains(r => r.response.statusCode === 200)).notOk()
            .expect(logger.requests.length).eql(0);

        await t
            .navigateTo(pageUrl)
            .expect(logger.contains(r => r.request.url === pageUrl)).ok();

        await t
            .expect(logger.requests.length).eql(1)
            .expect(logger.requests[0].request.url).eql(pageUrl)
            .expect(logger.requests[0].response.statusCode).eql(304);
    });
