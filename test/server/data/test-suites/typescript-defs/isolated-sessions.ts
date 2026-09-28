import { Role, Selector } from 'testcafe';

const pageUrl = 'http://localhost:3000/fixtures/isolated-sessions/pages/index.html';

const someUser = Role(pageUrl, async t => {
    await t.typeText('#name', 'SomeUser');
});

fixture `Isolated sessions`
    .page(pageUrl);

test('Chained actions', async t => {
    const t2 = await t.openIsolatedSession();

    await t2
        .maximizeWindow()
        .navigateTo(pageUrl)
        .click('#button', { offsetX: 1, modifiers: { shift: true } })
        .rightClick(Selector('#button'))
        .doubleClick('#button')
        .hover('#button')
        .drag('#button', 10, 20)
        .dragToElement('#button', Selector('#target'), { destinationOffsetX: 1 })
        .typeText('#input', 'text', { replace: true })
        .pressKey('ctrl+a')
        .selectText('#input', 0, 2)
        .scroll(0, 500)
        .scroll('#target', 'center')
        .scrollBy(0, 100)
        .scrollBy('#target', 0, 100)
        .scrollIntoView('#target')
        .dispatchEvent('#button', 'click', { bubbles: true })
        .wait(100)
        .useRole(someUser)
        .setCookies({ name: 'value' }, 'http://localhost:3000')
        .deleteCookies('name', 'http://localhost:3000')
        .setFilesToUpload('#file', ['a.txt', 'b.txt'])
        .clearUpload('#file')
        .switchToIframe('#iframe')
        .switchToMainWindow()
        .resizeWindow(800, 600)
        .setWindowBounds({ left: 0, top: 0, width: 800, height: 600 })
        .setHttpAuth('user', 'password')
        .setPageLoadTimeout(1000)
        .expect(Selector('#target').exists).ok();
});

test('Values and run', async t => {
    const t2 = await t.openIsolatedSession();

    const cookies: CookieOptions[] = await t2.getCookies(['name'], 'http://localhost:3000');
    const title: string            = await t2.eval(() => document.title);
    const screenshotPath: string   = await t2.takeScreenshot('isolated.png');
    const elementPath: string      = await t2.takeElementScreenshot('#target');

    await t2.expect(cookies.length).eql(1);

    await t2.run(async () => {
        await t.click('#button');
        await t2.click('#button').typeText('#input', title + screenshotPath + elementPath);
    });
});
