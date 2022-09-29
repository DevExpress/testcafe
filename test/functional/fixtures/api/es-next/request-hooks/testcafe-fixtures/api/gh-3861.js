import { RequestLogger, RequestMock } from 'testcafe';

const testUrl = 'https://some-unreachable-url.com';

const logger = RequestLogger(testUrl);

const mock = RequestMock()
    .onRequestTo(testUrl)
    .respond();

fixture ('Fixture')
    .requestHooks(mock);

test('test', async t => {
    await t
        .addRequestHooks(logger)
        .navigateTo(testUrl)
        .expect(logger.count(() => true)).eql(1)
        .removeRequestHooks(logger);
});
