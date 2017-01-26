import { t, Selector } from 'testcafe';

fixture `TestControllerProxy`
    .page `http://localhost:3000/fixtures/api/es-next/test-controller/pages/index.html`;

async function compareUA () {
    const ua = await t.eval(() => navigator.userAgent);

    await t
        .click('#showUA')
        .expect(Selector('#userAgent').textContent).eql(ua);

    t.ctx = ua;
}

test('Proxy object', async () => {
    await compareUA();
}).after(async t2 => {
    const ua = await t2.eval(() => navigator.userAgent);

    await t2.expect(t2.ctx).eql(ua);
});
