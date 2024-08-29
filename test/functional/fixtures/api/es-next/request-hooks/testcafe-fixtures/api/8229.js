import { RequestMock, Selector } from 'testcafe';

const PAGE_URL = 'http://localhost:3000/fixtures/api/es-next/request-hooks/pages/api/empty.html';

fixture('Fixture')
    .page(PAGE_URL);

test('before the skipped', async t => {
    await t.expect(Selector('h1').exists).ok();
});

test.skip.requestHooks(
    RequestMock().onRequestTo(/.*empty*/).respond('', 404)
)('skipped', async t => {
    await t.expect(Selector('h1').exists).ok();
});

test('after the skipped', async t => {
    await t.expect(Selector('h1').exists).ok();
});
