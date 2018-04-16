import { ClientFunction, RequestLogger } from 'testcafe';
import userAgent from 'useragent';

const pageUrl = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/index.html';
const logger1 = new RequestLogger(pageUrl);
const logger2 = new RequestLogger(pageUrl);

fixture `Fixture`
    .page(pageUrl);

test
    .requestHooks(logger1)
    ('Conditional adding', async t => {
        const userAgentStr = await ClientFunction(() => window.navigator.userAgent)();
        const browserName  = userAgent.parse(userAgentStr).family;

        if (browserName === 'Chrome')
            await t.addRequestHooks(logger2);

        await t
            .navigateTo(pageUrl)
            .expect(logger1.contains(r => r.request.url === pageUrl)).ok();

        if (browserName === 'Chrome')
            await t.expect(logger2.contains(r => r.request.url === pageUrl)).ok();
        else
            await t.expect(logger2.contains(r => r.request.url === pageUrl)).notOk();
    });
