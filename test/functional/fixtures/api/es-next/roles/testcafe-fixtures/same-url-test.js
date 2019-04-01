import { Role, ClientFunction } from 'testcafe';
import { hasFlag, setFlag } from './utils';

const loginPageUrl = 'http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html';

fixture `Same url test`
    .page(loginPageUrl)
    .beforeEach(async () => {
        await setFlag();
    });

const role = Role(loginPageUrl, async t => {
    await t
        .typeText('input[name="name"]', 'User')
        .click('input[value="LogIn"]');
});

const getToken = ClientFunction(() => {
    return localStorage.getItem('token');
});

test('First role initialization', async t => {
    await t
        .expect(hasFlag()).ok()
        .useRole(role)
        .expect(hasFlag()).notOk()
        .expect(getToken()).eql('123456789User');
});

test('Using of the initialized role', async t => {
    await t
        .expect(hasFlag()).ok()
        .useRole(role)
        .expect(hasFlag()).notOk()
        .expect(getToken()).eql('123456789User');
});
