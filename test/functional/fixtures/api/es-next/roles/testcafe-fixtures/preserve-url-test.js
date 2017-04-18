import { Role, Selector, t } from 'testcafe';

const role = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/login-page.html', async () => {
    await t
        .typeText('input[name="name"]', 'User1')
        .click('input[value="LogIn"]')
        .navigateTo('http://localhost:3000/fixtures/api/es-next/roles/pages/preserved-page.html');
}, { preserveUrl: true });


fixture `Preserve URL`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/index.html`;


test('Preserve url test', async () => {
    // NOTE: we should restore dialog handler, but omit iframe settings.
    await t
        .setNativeDialogHandler(() => true)
        .switchToIframe('#iframe')
        .useRole(role)
        .expect(Selector('body').textContent).contains('$Preserved$')
        .navigateTo('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html')
        .click('#show-alert');
});
