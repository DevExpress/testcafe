import { noop } from 'lodash';
import { Role, t } from 'testcafe';

const roleWithInitErr = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html', () => {
    throw new Error('Hey!');
});

fixture `Errors`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/index.html`;

test('Test1', async () => {
    await t.useRole(roleWithInitErr);
});

test('Test2', noop);

test('Test3', async () => {
    await t.useRole(roleWithInitErr);
});
