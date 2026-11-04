import { Selector } from 'testcafe';

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

test('click waits for element to appear', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // The button appears 800ms after the click is enqueued — the action must wait
    await t2.eval(() => {
        setTimeout(() => {
            const btn = document.createElement('button');

            btn.id          = 'delayed-btn';
            btn.textContent = 'Delayed';
            btn.onclick     = () => {
                document.querySelector('#result').textContent = 'delayed-clicked';
            };

            document.body.appendChild(btn);
        }, 800);
    });

    await t2.click('#delayed-btn');

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('delayed-clicked');
});

test('pressKey dispatches canonical key values', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Application handlers match on event.key === 'Enter' — the exact DOM value
    await t2.eval(() => {
        document.querySelector('#text-input').addEventListener('keydown', e => {
            if (e.key === 'Enter')
                document.querySelector('#result').textContent = 'enter-pressed';
        });
    });

    await t2.click('#text-input');
    await t2.pressKey('enter');

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('enter-pressed');
});

test('click honors modifiers and offsets', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.eval(() => {
        document.querySelector('#drop-target').addEventListener('click', e => {
            document.querySelector('#result').textContent = 'ctrl:' + e.ctrlKey + ' x:' + e.offsetX;
        });
    });

    // #drop-target is 100x100 — offset (5, 5) lands near the corner, not the center
    await t2.click('#drop-target', { modifiers: { ctrl: true }, offsetX: 5, offsetY: 5 });

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).contains('ctrl:true');

    const clickX = parseInt(result.match(/x:(-?\d+)/)[1], 10);

    await t.expect(clickX).lt(20);
});

test('A caught error on a direct method does not block later commands', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    let message = '';

    await t2.eval(() => {
        throw new Error('deliberate');
    }).catch(err => {
        message = err.message;
    });

    await t.expect(message).contains('deliberate');

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/second.html');

    const title = await t2.eval(() => document.title);

    await t.expect(title).eql('Second Page');
});

test('Chained assertions and actions outside t2.run()', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2
        .expect(Selector('#btn').exists).ok()
        .expect(Selector('#nonexistent').exists).notOk()
        .click('#btn')
        .expect(Selector('#result').innerText).eql('clicked');
});
