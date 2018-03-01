import { RequestLogger } from 'testcafe';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';
const logger  = new RequestLogger(pageUrl);

fixture `RequestLogger`
    .page(pageUrl)
    .before(async ctx => {
        ctx.requestsCountOnBeforeHook = logger.requests.length;
    });

test
    .requestHooks(logger)
    ('Not in test context', async t => {
        await t.expect(t.fixtureCtx.requestsCountOnBeforeHook).eql(0);
    });
