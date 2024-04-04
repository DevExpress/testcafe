import { RequestMock } from 'testcafe';
import DUMMY_URLS from '../../common/mock-routes.js';

const mock = RequestMock()
    .onRequestTo(DUMMY_URLS.secureGet)
    .respond(() => {
        throw new Error('Error in the "respond" method');
    });

fixture `Fixture`
    .requestHooks(mock);

test('test', async t => {
    await t.navigateTo(DUMMY_URLS.secureGet);
});
