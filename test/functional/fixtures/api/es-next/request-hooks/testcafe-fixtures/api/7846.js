import { RequestHook, RequestLogger } from 'testcafe';

const PAGE_URL = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/api/empty.html';

export class TestHook extends RequestHook {
    constructor () {
        super(PAGE_URL);
    }
    async onRequest (event) {
        event.requestOptions.headers['test-header'] = 'true';
    }

    async onResponse () {}
}

const logger = RequestLogger(PAGE_URL, {
    logRequestHeaders: true,
});

const testHook = new TestHook();

fixture `fixture`
    .requestHooks(testHook, logger);

test('test', async t => {
    await t
        .navigateTo(PAGE_URL)
        .expect(logger.contains(r => r.request.url === PAGE_URL)).ok();

    await t.expect(logger.requests[0].request.headers['test-header']).eql('true');
});
