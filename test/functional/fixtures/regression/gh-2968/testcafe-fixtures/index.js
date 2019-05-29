import { Role } from 'testcafe';

const url = 'http://localhost:3000/fixtures/regression/gh-2968/pages/index.html';

const user = new Role(`${url}/login.html`, async () => {
});

fixture('`beforeunload` dialog handler and roles')
    .page(url);

test('Handle beforeunload dialog', async t => {
    await t
        .setNativeDialogHandler(() => {
            return true;
        })
        .useRole(user);
});
