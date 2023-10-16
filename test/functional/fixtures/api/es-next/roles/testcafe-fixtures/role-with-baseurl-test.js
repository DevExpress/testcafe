import { Role, ClientFunction } from 'testcafe';

fixture `Roles with absolute/relative "loginUrl"`;

const getLocation = ClientFunction(() => document.location.toString());

const roleAbs = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html', async t => {
    await t.expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html');
}, { preserveUrl: true });

const roleRel = Role('./fixtures/api/es-next/roles/pages/index.html', async t => {
    await t.expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html');
}, { preserveUrl: true });

test('Should throw error in role initializer without baseUrl and with relative path Role', async t => {
    await t.useRole(roleRel);
});

test('Use role with relative path and baseUrl', async t => {
    await t.useRole(roleRel);
});

test('Use role with absolute path and baseUrl', async t => {
    await t.useRole(roleAbs);
});
