import { Selector, Role, t } from 'testcafe';

const iframeElement = Selector('#element-in-iframe');
const pageElement   = Selector('#element-on-page');
const showAlertBtn  = Selector('#show-alert');

async function initConfiguration () {
    await t
        .setNativeDialogHandler(() => true)
        .click(showAlertBtn);

    const history = await t.getNativeDialogHistory();

    /* eslint-disable no-console */
    await t
        .expect(history[0].text).eql('Hey!')
        .switchToIframe('#iframe')
        .expect(iframeElement.exists).ok()
        .setTestSpeed(0.95)
        .setPageLoadTimeout(95)
        .eval(() => console.log('init-configuration'));
    /* eslint-enable no-console */

    t.ctx.someVal        = 'ctxVal';
    t.fixtureCtx.someVal = 'fixtureCtxVal';
}

const role1 = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html', async () => {
    await t
        .expect(pageElement.exists).ok()
        .expect(t.ctx.someVal).notOk()
        .expect(t.fixtureCtx.someVal).notOk();

    await t.click(showAlertBtn);
});

const role2 = Role('http://localhost:3000/fixtures/api/es-next/roles/pages/index.html', async () => {
    /* eslint-disable no-console */
    await t.eval(() => console.log('init-role'));
    /* eslint-enable no-console */

    const { log } = await t.getBrowserConsoleMessages();

    await t.expect(log).eql(['init-role']);
});

fixture `Configuration management`
    .page `http://localhost:3000/fixtures/api/es-next/roles/pages/index.html`;


test('Clear configuration', async () => {
    await initConfiguration();
    await t.useRole(role1);
});

test('Restore configuration', async () => {
    await initConfiguration();

    let { log } = await t.getBrowserConsoleMessages();

    await t
        .expect(log).eql(['init-configuration'])
        .useRole(role2)
        .expect(iframeElement.exists).ok()
        .expect(t.ctx.someVal).eql('ctxVal')
        .expect(t.fixtureCtx.someVal).eql('fixtureCtxVal');

    await t
        .switchToMainWindow()
        .click(showAlertBtn);

    const history = await t.getNativeDialogHistory();

    await t.expect(history[0].text).eql('Hey!');

    log = (await t.getBrowserConsoleMessages()).log;

    await t.expect(log).eql(['init-configuration']);
});
