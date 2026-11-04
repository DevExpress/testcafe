import { Selector } from 'testcafe';

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

test('navigateTo after switchToIframe resets the eval context', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe('#test-iframe');

    const iframeTitle = await t2.eval(() => document.querySelector('#iframe-title').textContent);

    await t.expect(iframeTitle).eql('Inside Iframe');

    // Navigating destroys the iframe context — evals must target the new page,
    // not time out against the stale iframe context
    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const title = await t2.eval(() => document.title);

    await t.expect(title).eql('Isolated Sessions Test Page');
});

test('switchToIframe with a Selector object', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe(Selector('#test-iframe'));

    const title = await t2.eval(() => document.querySelector('#iframe-title').textContent);

    await t.expect(title).eql('Inside Iframe');
});

test('switchToIframe with Selector nth picks that iframe', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframes.html');
    await t2.switchToIframe(Selector('iframe').nth(1));

    const title = await t2.eval(() => document.querySelector('h2').textContent);

    await t.expect(title).eql('Second Frame');
});

test('switchToIframe with an attribute selector and a nested iframe', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframes.html');
    await t2.switchToIframe('iframe[name="second"]');

    const title = await t2.eval(() => document.querySelector('h2').textContent);

    await t.expect(title).eql('Second Frame');

    await t2.switchToIframe('#nested');

    const nestedTitle = await t2.eval(() => document.querySelector('h2').textContent);

    await t.expect(nestedTitle).eql('Inside Iframe');
});

test('eval inside an iframe sees the page globals', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe('#test-iframe');

    const value = await t2.eval(() => window.iframeGlobal);

    await t.expect(value).eql('iframe-global');
});

test('click and typeText inside an iframe', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/iframe.html');
    await t2.switchToIframe('#test-iframe');
    await t2.click('#iframe-btn').typeText('#iframe-input', 'typed in frame');

    await t.expect(await t2.eval(() => document.querySelector('#iframe-result').textContent)).eql('iframe-clicked');
    await t.expect(await t2.eval(() => document.querySelector('#iframe-input').value)).eql('typed in frame');
});
