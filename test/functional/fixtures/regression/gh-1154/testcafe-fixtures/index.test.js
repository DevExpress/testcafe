fixture('gh-1154')
    .page `http://localhost:3000/fixtures/regression/gh-1154/pages/index.html`;

test('Perform an action in iframe', async t => {
    await t
        .switchToIframe('iframe')
        .click('#target');
});
