import { RequestMock } from 'testcafe';

const mock = RequestMock()
    .onRequestTo('http://dummy-url.com/get')
    .respond(() => {
        throw new Error('Error in the "respond" method');
    });

fixture `Fixture`
    .requestHooks(mock);

test('test', async t => {
    await t.navigateTo('http://dummy-url.com/get');
});
