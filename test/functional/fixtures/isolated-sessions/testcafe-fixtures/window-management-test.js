fixture `Isolated Sessions - Window Management`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('maximizeWindow', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.maximizeWindow();

    // Window should be at or near screen dimensions
    const dims = await t2.eval(() => JSON.stringify({ w: window.outerWidth, h: window.outerHeight }));
    const { w, h } = JSON.parse(dims);

    await t.expect(w).gte(800);
    await t.expect(h).gte(600);
});

test('resizeWindow', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.resizeWindow(800, 600);

    const dims = await t2.eval(() => JSON.stringify({ w: window.outerWidth, h: window.outerHeight }));
    const { w, h } = JSON.parse(dims);

    await t.expect(w).eql(800);
    await t.expect(h).eql(600);
});

test('setPageLoadTimeout', async t => {
    const t2 = await t.openIsolatedSession();

    // Set a long timeout — should not throw
    await t2.setPageLoadTimeout(60000);
    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const title = await t2.eval(() => document.title);

    await t.expect(title).eql('Isolated Sessions Test Page');
});
