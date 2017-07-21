import { Role, Selector, t } from 'testcafe';

const userName          = Selector('#user-name');
const localStorageToken = Selector('#local-storage-token');

const someUser = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html', async () => {
    await t
        .typeText('input[name="name"]', 'SomeUser')
        .click('input[value="LogIn"]');
});

fixture `AnonymousRole`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/index.html`;

test('Test1', async () => {
    await t
        .useRole(someUser)
        .expect(userName.textContent).eql('SomeUser')
        .expect(localStorageToken.textContent).eql('123456789SomeUser')
        .useRole(Role.anonymous())
        .expect(userName.textContent).eql('')
        .expect(localStorageToken.textContent).eql('');
});
