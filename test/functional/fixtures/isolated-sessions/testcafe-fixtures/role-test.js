import { Role } from 'testcafe';

const PAGE_URL = 'http://localhost:3000/fixtures/isolated-sessions/pages/index.html';

const testRole = Role(PAGE_URL, async t => {
    await t.eval(() => {
        document.cookie = 'role-cookie=role-value';
        localStorage.setItem('role-key', 'role-value');
    });
});

fixture `Isolated Sessions - Roles`
    .page(PAGE_URL);

test('useRole applies cookies and storage to isolated session', async t => {
    // Initialize the role in the main session first — isolated sessions can only
    // consume an existing state snapshot
    await t.useRole(testRole);

    const t2 = await t.openIsolatedSession();

    await t2.useRole(testRole);
    await t2.navigateTo(PAGE_URL);

    const cookie  = await t2.eval(() => document.cookie);
    const storage = await t2.eval(() => localStorage.getItem('role-key'));

    await t
        .expect(cookie).contains('role-cookie=role-value')
        .expect(storage).eql('role-value');
});
