fixture `Isolated Sessions - Iframe`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');

test('switchToIframe and eval inside iframe', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe('#test-iframe');

    // eval executes in the iframe context after switchToIframe
    const title = await t2.eval(() => document.querySelector('#iframe-title').textContent);

    await t.expect(title).eql('Inside Iframe');
});

test('switchToIframe and interact via eval', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe('#test-iframe');

    // Click via eval inside the iframe context
    await t2.eval(() => {
        document.querySelector('#iframe-btn').click();
    });

    const result = await t2.eval(() => document.querySelector('#iframe-result').textContent);

    await t.expect(result).eql('iframe-clicked');
});

test('switchToMainWindow after iframe', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe('#test-iframe');

    const iframeTitle = await t2.eval(() => document.querySelector('#iframe-title').textContent);

    await t.expect(iframeTitle).eql('Inside Iframe');

    await t2.switchToMainWindow();

    const mainTitle = await t2.eval(() => document.querySelector('h1').textContent);

    await t.expect(mainTitle).eql('Iframe Container');
});
