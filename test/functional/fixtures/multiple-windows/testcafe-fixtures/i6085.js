const newWindowUrl = 'http://localhost:3000/fixtures/multiple-windows/pages/i6085/window.html';

fixture `Should not hang if switching to a window from iframe`
    .page `http://localhost:3000/fixtures/multiple-windows/pages/i6085/index.html`;

test('Should not hang if switching to a window from iframe', async t => {
    const newWindow = await t.openWindow(newWindowUrl);

    await t.switchToParentWindow();
    await t.switchToIframe('iframe');
    await t.switchToWindow(newWindow);
    await t.click('h1');
});
