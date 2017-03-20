import { Role, Selector, t } from 'testcafe';

let role1Executions = 0;
let role2Executions = 0;

const userName = Selector('#user-name');
const token    = Selector('#token');

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
        .expect(token.textContent).eql('');

    // Switch to role1
    await t
        .useRole(role1)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User1');

    // Set token for role1
    await setToken('Token1');

    await t.expect(token.textContent).eql('Token1');

    // Switch to role2
    await t
        .useRole(role2)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User2');

    // Set token for role2
    await setToken('Token2');

    await t.expect(token.textContent).eql('Token2');

    // Switch to role1
    await t
        .useRole(role1)
        .expect(token.textContent).eql('Token1')
        .expect(userName.textContent).eql('User1');


    // Switch to role2
    await t
        .useRole(role2)
        .expect(token.textContent).eql('Token2')
        .expect(userName.textContent).eql('User2');
});


test('Test2', async () => {
    // Switch to role1
    await t
        .useRole(role1)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User1');


    // Switch to role2
    await t
        .useRole(role2)
        .expect(token.textContent).eql('')
        .expect(userName.textContent).eql('User2');
});
