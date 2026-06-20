import { Selector } from 'testcafe';

fixture `Isolated Sessions - Basic Isolation`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('Cookie isolation between sessions', async t => {
    // Set a cookie in the main session
    await t.eval(() => {
        document.cookie = 'user=alice';
    });

    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    // Set a different cookie in the isolated session
    await t2.eval(() => {
        document.cookie = 'user=bob';
    });

    // Verify cookies are separate
    const mainCookie     = await t.eval(() => document.cookie);
    const isolatedCookie = await t2.eval(() => document.cookie);

    await t
        .expect(mainCookie).contains('user=alice')
        .expect(isolatedCookie).contains('user=bob')
        .expect(isolatedCookie).notContains('user=alice');
});

test('localStorage isolation between sessions', async t => {
    await t.eval(() => {
        localStorage.setItem('key', 'main-value');
    });

    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.eval(() => {
        localStorage.setItem('key', 'isolated-value');
    });

    const mainValue    = await t.eval(() => localStorage.getItem('key'));
    const isolatedValue = await t2.eval(() => localStorage.getItem('key'));

    await t
        .expect(mainValue).eql('main-value')
        .expect(isolatedValue).eql('isolated-value');
});

test('sessionStorage isolation between sessions', async t => {
    await t.eval(() => {
        sessionStorage.setItem('session', 'main');
    });

    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.eval(() => {
        sessionStorage.setItem('session', 'isolated');
    });

    const mainVal    = await t.eval(() => sessionStorage.getItem('session'));
    const isolatedVal = await t2.eval(() => sessionStorage.getItem('session'));

    await t
        .expect(mainVal).eql('main')
        .expect(isolatedVal).eql('isolated');
});

test('DOM isolation between sessions', async t => {
    await t.typeText('#text-input', 'main-text');

    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.typeText('#text-input', 'isolated-text');

    // Verify each session has its own DOM state
    await t.expect(Selector('#text-input').value).eql('main-text');

    const isolatedInputValue = await t2.eval(() => document.querySelector('#text-input').value);

    await t.expect(isolatedInputValue).eql('isolated-text');
});

test('Multiple isolated sessions', async t => {
    await t.eval(() => {
        document.cookie = 'user=alice';
    });

    const t2 = await t.openIsolatedSession();
    const t3 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t3.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    await t2.eval(() => {
        document.cookie = 'user=bob';
    });
    await t3.eval(() => {
        document.cookie = 'user=charlie';
    });

    const cookieMain = await t.eval(() => document.cookie);
    const cookie2    = await t2.eval(() => document.cookie);
    const cookie3    = await t3.eval(() => document.cookie);

    await t
        .expect(cookieMain).contains('user=alice')
        .expect(cookie2).contains('user=bob')
        .expect(cookie3).contains('user=charlie')
        .expect(cookie2).notContains('user=alice')
        .expect(cookie3).notContains('user=bob');
});

test('Automatic cleanup on test end', async t => {
    // This test just opens an isolated session and does nothing else.
    // The session should be automatically disposed when the test ends without errors.
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const title = await t2.eval(() => document.title);

    await t.expect(title).eql('Isolated Sessions Test Page');
});
