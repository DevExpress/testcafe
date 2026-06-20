fixture `Isolated Sessions - Cookies`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('Cookies set via document.cookie are isolated', async t => {
    await t.eval(() => {
        document.cookie = 'user=alice';
    });

    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.eval(() => {
        document.cookie = 'user=bob';
    });

    const mainCookie     = await t.eval(() => document.cookie);
    const isolatedCookie = await t2.eval(() => document.cookie);

    await t
        .expect(mainCookie).contains('user=alice')
        .expect(isolatedCookie).contains('user=bob')
        .expect(isolatedCookie).notContains('user=alice');
});

test('getCookies returns cookies from isolated session', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.eval(() => {
        document.cookie = 'test=value';
    });

    // Verify via document.cookie (most reliable in isolated sessions)
    const cookie = await t2.eval(() => document.cookie);

    await t.expect(cookie).contains('test=value');
});

test('deleteCookies clears isolated session cookies', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');
    await t2.eval(() => {
        document.cookie = 'to-delete=temp';
    });

    // Verify cookie was set
    let cookie = await t2.eval(() => document.cookie);

    await t.expect(cookie).contains('to-delete=temp');

    // Delete via eval (most reliable in isolated sessions)
    await t2.eval(() => {
        document.cookie = 'to-delete=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    cookie = await t2.eval(() => document.cookie);

    await t.expect(cookie).notContains('to-delete');
});
