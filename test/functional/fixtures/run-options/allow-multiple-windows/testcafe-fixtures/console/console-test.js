fixture `Fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/console/first.html');

test('test', async t => {
    await t.click('#triggerConsoleMessages1');

    let messages = await t.getBrowserConsoleMessages();

    await t
        .expect(messages.error).eql(['error-first-page'])
        .expect(messages.warn).eql(['warn-first-page'])
        .expect(messages.log).eql(['log-first-page'])
        .expect(messages.info).eql(['info-first-page']);

    await t
        .click('#openSecondPageBtn')
        .click('#triggerConsoleMessages2');

    messages = await t.getBrowserConsoleMessages();

    await t
        .expect(messages.error).eql(['error-second-page'])
        .expect(messages.warn).eql(['warn-second-page'])
        .expect(messages.log).eql(['log-second-page'])
        .expect(messages.info).eql(['info-second-page']);
});
