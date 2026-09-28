fixture `Isolated Sessions - HTTP Auth`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('setHttpAuth attaches basic auth credentials', async t => {
    const t2 = await t.openIsolatedSession();

    let message = '';

    try {
        await t2.navigateTo('http://localhost:3002/');
    }
    catch (err) {
        message = err.message;
    }

    await t.expect(message).contains('net::ERR_INVALID_AUTH_CREDENTIALS');

    await t2.setHttpAuth('username', 'password');
    await t2.navigateTo('http://localhost:3002/');

    const after = await t2.eval(() => document.querySelector('#result').textContent);

    await t.expect(after).eql('authorized');
});
