import { Role, Selector, t } from 'testcafe';

let role1Executions = 0;
let role2Executions = 0;

const userName            = Selector('#user-name');
const token               = Selector('#token');
const localStorageToken   = Selector('#local-storage-token');
const sessionStorageToken = Selector('#session-storage-token');

const role1 = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html', async () => {
    await t
        .typeText('input[name="name"]', 'User1')
        .click('input[value="LogIn"]');

    role1Executions++;
});

const role2 = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html', async () => {
    await t
        .typeText('input[name="name"]', 'User2')
        .click('input[value="LogIn"]');

    role2Executions++;
});

async function setToken (tokenValue) {
    await t
        .typeText('input[name="token"]', tokenValue)
        .click('input[value="SetToken"]');
}


fixture `UseRole`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/index.html`
    .afterEach(async () => {
        await t
            .expect(role1Executions).eql(1)
            .expect(role2Executions).eql(1);
    });

test('Test1', async () => {
    // Check initial state
    await t
        .expect(userName.textContent).eql('')
        .expect(token.textContent).eql('')
        .expect(localStorageToken.textContent).eql('')
        .expect(sessionStorageToken.textContent).eql('');

    // Switch to role1
    await t
        .useRole(role1)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User1')
        .expect(localStorageToken.textContent).eql('123456789User1')
        .expect(sessionStorageToken.textContent).eql('');

    // Set token for role1
    await setToken('Token1');

    await t
        .expect(token.textContent).eql('Token1')
        .expect(sessionStorageToken.textContent).eql('qwertyUser1');

    // Switch to role2
    await t
        .useRole(role2)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User2')
        .expect(localStorageToken.textContent).eql('123456789User2')
        .expect(sessionStorageToken.textContent).eql('');

    // Set token for role2
    await setToken('Token2');

    await t.expect(token.textContent).eql('Token2')
        .expect(sessionStorageToken.textContent).eql('qwertyUser2');

    // Switch to role1
    await t
        .useRole(role1)
        .expect(token.textContent).eql('Token1')
        .expect(userName.textContent).eql('User1')
        .expect(localStorageToken.textContent).eql('123456789User1')
        .expect(sessionStorageToken.textContent).eql('qwertyUser1');


    // Switch to role2
    await t
        .useRole(role2)
        .expect(token.textContent).eql('Token2')
        .expect(userName.textContent).eql('User2')
        .expect(localStorageToken.textContent).eql('123456789User2')
        .expect(sessionStorageToken.textContent).eql('qwertyUser2');
});


test('Test2', async () => {
    // Switch to role1
    await t
        .useRole(role1)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User1')
        .expect(localStorageToken.textContent).eql('123456789User1')
        .expect(sessionStorageToken.textContent).eql('');


    // Switch to role2
    await t
        .useRole(role2)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User2')
        .expect(localStorageToken.textContent).eql('123456789User2')
        .expect(sessionStorageToken.textContent).eql('');
});
