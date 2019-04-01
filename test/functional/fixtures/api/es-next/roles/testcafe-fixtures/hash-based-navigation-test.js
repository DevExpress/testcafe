import { Role, Selector } from 'testcafe';
import { setFlag, hasFlag } from './utils';

fixture `Should always reload the target url`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/page-with-hash-navigation.html`
    .beforeEach(async () => {
        await setFlag();
    });

const role = Role(`http://localhost:3000/fixtures/api/es-next/roles/pages/page-with-hash-navigation.html#login`,
    async t => {
        await t.click('input');
    }, { preserveUrl: true });

test('First role initialization', async t => {
    await t
        .expect(hasFlag()).ok()
        .useRole(role)
        .expect(hasFlag()).notOk()
        .expect(Selector('h1').innerText).eql('Authorized');
});

test('Using of the initialized role', async t => {
    await t
        .expect(hasFlag()).ok()
        .useRole(role)
        .expect(hasFlag()).notOk()
        .expect(Selector('h1').innerText).eql('Authorized');
});
