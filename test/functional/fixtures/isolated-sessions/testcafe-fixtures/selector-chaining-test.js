import { Selector } from 'testcafe';

fixture `Isolated Sessions - Selector Chaining`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('click with Selector object', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.click(Selector('#btn'));

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('clicked');
});

test('Selector.withText', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.click(Selector('button').withText('Click Me'));

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('clicked');
});

test('Selector.withExactText', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.click(Selector('button').withExactText('Click Me'));

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('clicked');
});

test('Selector.nth', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Click the second visible item (index 1)
    await t2.click(Selector('.item.visible').nth(1));

    // Verify it was the right one by checking the active element text
    const text = await t2.eval(() => {
        const items = document.querySelectorAll('.item.visible');

        return items[1] ? items[1].textContent : 'not found';
    });

    await t.expect(text).eql('Visible Item 2');
});

test('Selector.filterVisible', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Count visible items — should be 3 (the hidden one has display:none)
    const count = await t2.eval(() => {
        const items = document.querySelectorAll('.item');
        let c     = 0;

        for (const el of items) {
            if (el.offsetWidth > 0 || el.offsetHeight > 0)
                c++;
        }

        return c;
    });

    await t.expect(count).eql(3);
});

test('Selector.find', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.click(Selector('body').find('#btn'));

    const result = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(result).eql('clicked');
});

test('Selector.withAttribute', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.typeText(Selector('input').withAttribute('id', 'text-input'), 'attribute-selected');

    const value = await t2.eval(() => document.querySelector('#text-input').value);

    await t.expect(value).eql('attribute-selected');
});
