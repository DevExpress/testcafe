import { Selector, ClientFunction, t as globalT } from 'testcafe';

fixture `Isolated Sessions - t2.run()`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('Selector.exists evaluates in isolated session inside t2.run()', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        // Selector queries inside run() evaluate in the isolated tab's DOM
        await t.expect(Selector('#btn').exists).ok();
        await t.expect(Selector('#nonexistent').exists).notOk();
    });
});

test('Selector.visible evaluates in isolated session inside t2.run()', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        await t.expect(Selector('#btn').visible).ok();
        await t.expect(Selector('.hidden').visible).notOk();
    });
});

test('Selector.innerText evaluates in isolated session inside t2.run()', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        await t.expect(Selector('#title').innerText).eql('Main Page');
    });
});

test('ClientFunction evaluates in isolated session inside t2.run()', async t => {
    const getTitle = ClientFunction(() => document.title);
    const t2       = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        const title = await getTitle();

        await t.expect(title).eql('Isolated Sessions Test Page');
    });
});

test('t2.run() restores main session after callback', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Inside run(): selector evaluates in isolated tab
    await t2.run(async () => {
        await t.expect(Selector('#title').innerText).eql('Main Page');
    });

    // After run(): selector evaluates back in the main session
    await t.expect(Selector('#title').innerText).eql('Main Page');
});

test('Actions inside t2.run() use t2 directly', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Inside run(), use t2 for actions but selectors resolve in the isolated tab
    await t2.run(async () => {
        await t2.click('#btn');
        await t.expect(Selector('#result').innerText).eql('clicked');
    });

    // Main session should be unaffected
    const mainResult = await t.eval(() => document.querySelector('#result').textContent);

    await t.expect(mainResult).eql('');
});

test('Multiple t2.run() blocks in sequence', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        await t2.click('#btn');
        await t.expect(Selector('#result').innerText).eql('clicked');
    });

    await t2.run(async () => {
        await t2.typeText('#text-input', 'from run block');
        await t.expect(Selector('#text-input').value).eql('from run block');
    });
});

test('t2 assertions after t2.run() still target the isolated session', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.eval(() => {
        const el = document.createElement('div');

        el.id = 'isolated-only';
        document.body.appendChild(el);
    });

    await t2.run(async () => {
        await t2.expect(Selector('#isolated-only').exists).ok();
    });

    await t2.expect(Selector('#isolated-only').exists).ok();
});

test('Chained calls inside t2.run()', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        await t2
            .click('#btn')
            .typeText('#text-input', 'chained')
            .expect(Selector('#result').innerText).eql('clicked')
            .expect(Selector('#text-input').value).eql('chained');

        await globalT
            .click('#increment')
            .expect(Selector('#counter').innerText).eql('1');
    });
});

test('t2.run() waits for commands the callback did not await', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.run(async () => {
        t2.typeText('#text-input', 'not awaited');
    });

    const value = await t2.eval(() => document.getElementById('text-input').value);

    await t.expect(value).eql('not awaited');
});

test('Selector property read inside t2.run() waits for a late element', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.eval(() => {
        setTimeout(() => {
            const el = document.createElement('div');

            el.id          = 'late';
            el.textContent = 'late text';
            document.body.appendChild(el);
        }, 800);
    });

    await t2.run(async () => {
        const text = await Selector('#late').with({ timeout: 3000 }).innerText;

        await t.expect(text).eql('late text');
    });
});
