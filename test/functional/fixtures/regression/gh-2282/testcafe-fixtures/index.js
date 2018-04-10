import { Selector, Role } from 'testcafe';

const role = Role('http://localhost:3000/fixtures/regression/gh-2282/pages/login.html', async t => {
    await t.click(Selector('#login'));
}, { preserveUrl: true });


fixture `GH-2282 - Cookies should be restored correctly when User Roles with the preserveUrl option are used`
    .beforeEach(async t => {
        await t.useRole(role);
    });

test('Login and save cookies in the role', async t => {
    await t.expect(Selector('#result').textContent).contains('logged');
});

test('Restore cookies from the role', async t => {
    await t.expect(Selector('#result').textContent).contains('logged');
});


