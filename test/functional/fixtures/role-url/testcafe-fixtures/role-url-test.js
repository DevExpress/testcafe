import { Role } from 'testcafe';

const roleAbs = Role('http://localhost:3000/fixtures/role-url/pages/index.html', async t => {
    await t.wait(1000);
});

const roleRel = Role('./fixtures/role-url/pages/index.html', async t => {
    await t.wait(1000);
});


fixture `My Fixture`;

test('Should throw error in role initializer without baseUrl and with relative path Role', async t => {
    await t
        .useRole(roleRel);
});

test('Should get success with baseUrl and with relative path Role', async t => {
    await t
        .useRole(roleRel);
});

test('Should get success with baseUrl and with absolute path Role', async t => {
    await t
        .useRole(roleAbs);
});
