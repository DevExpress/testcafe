fixture `Isolated Sessions - Commands`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('click', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.click('#btn');

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('clicked');
});

test('typeText', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.typeText('#text-input', 'hello world');

    const value = await t2.eval(() => document.querySelector('#text-input').value);

    await t.expect(value).eql('hello world');
});

test('typeText with replace', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.typeText('#text-input', 'original');
    await t2.typeText('#text-input', 'replaced', { replace: true });

    const value = await t2.eval(() => document.querySelector('#text-input').value);

    await t.expect(value).eql('replaced');
});

test('hover', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.hover('#hover-target');

    const text = await t2.eval(() => document.querySelector('#hover-target').textContent);

    await t.expect(text).eql('hovered');
});

test('doubleClick', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Double-click selects the word in the input
    await t2.typeText('#text-input', 'hello');
    await t2.doubleClick('#text-input');

    const selected = await t2.eval(() => window.getSelection().toString());

    await t.expect(selected).eql('hello');
});

test('pressKey', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.typeText('#text-input', 'hello');
    await t2.pressKey('ctrl+a');
    await t2.pressKey('delete');

    const value = await t2.eval(() => document.querySelector('#text-input').value);

    await t.expect(value).eql('');
});

test('navigateTo', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/second.html');

    const title = await t2.eval(() => document.querySelector('#title').textContent);

    await t.expect(title).eql('Second Page');
});

test('scroll and scrollBy', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.scroll(0, 500);

    const scrollY1 = await t2.eval(() => window.scrollY);

    await t.expect(scrollY1).gte(400);

    await t2.scrollBy(0, -200);

    const scrollY2 = await t2.eval(() => window.scrollY);

    await t.expect(scrollY2).lt(scrollY1);
});

test('scrollIntoView', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.scrollIntoView('#scroll-anchor');

    const scrollY = await t2.eval(() => window.scrollY);

    await t.expect(scrollY).gt(0);
});

test('eval', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const title = await t2.eval(() => document.title);

    await t.expect(title).eql('Isolated Sessions Test Page');
});

test('eval with return value', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const sum = await t2.eval(() => 2 + 3);

    await t.expect(sum).eql(5);
});

test('wait', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const before = Date.now();

    await t2.wait(500);

    const elapsed = Date.now() - before;

    await t.expect(elapsed).gte(400);
});

test('expect assertion', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.expect(true).ok();
    await t2.expect('hello').eql('hello');
    await t2.expect(42).gt(10);
    await t2.expect('foobar').contains('bar');
});

test('dispatchEvent', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Listen for a custom event
    await t2.eval(() => {
        window.__customEventFired = false;

        document.querySelector('#btn').addEventListener('my-event', () => {
            window.__customEventFired = true;
        });
    });

    await t2.dispatchEvent('#btn', 'my-event');

    const fired = await t2.eval(() => window.__customEventFired);

    await t.expect(fired).ok();
});
