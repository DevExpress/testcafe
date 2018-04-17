fixture `GH-2308 - Use a location port for service urls`
    .page `http://localhost:3000/fixtures/regression/gh-2308/pages/index.html`;

test('Load a top window on the cross-domain port', async t => {
    await t
        .switchToIframe('iframe')
        .click('[type="submit"]')
        .switchToMainWindow()
        .click('body');
});

test('Second test', async () => {
    // NOTE: The first test is never going to end and the second test will never begin
    // if the `heartbeat` message is using a cross-domain port
});
