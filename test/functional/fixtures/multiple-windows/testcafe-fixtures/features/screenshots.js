const RED_PAGE   = 'http://localhost:3000/fixtures/multiple-windows/pages/features/screenshots/red.html';
const GREEN_PAGE = 'http://localhost:3000/fixtures/multiple-windows/pages/features/screenshots/green.html';

fixture `Screenshots`
    .page(RED_PAGE);

test('should make screenshots of multiple windows', async t => {
    await t.takeScreenshot(`custom/${t.browser.alias}0.png`);

    const child = await t.openWindow(GREEN_PAGE);

    await t.takeScreenshot(`custom/${t.browser.alias}1.png`);
    await t.openWindow(RED_PAGE);
    await t.takeScreenshot(`custom/${t.browser.alias}2.png`);
    await t.switchToWindow(child);
    await t.takeScreenshot(`custom/${t.browser.alias}3.png`);
});
